import json
import smtplib
import os
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

TELEGRAM_CHAT_ID = "-1002412483272"

def send_telegram(token: str, text: str):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=10)

def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта питомника ХВОЯ на почту и в Telegram"""

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    message = body.get('message', '').strip()
    cart = body.get('cart', [])

    if not name or not phone:
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Укажите имя и телефон'})
        }

    # ── Telegram ──
    tg_text = f"🌲 <b>Новая заявка — ХВОЯ</b>\n\n👤 <b>Имя:</b> {name}\n📞 <b>Телефон:</b> {phone}"
    if message:
        tg_text += f"\n💬 <b>Сообщение:</b> {message}"
    if cart:
        total = sum(i.get('price', 0) * i.get('qty', 1) for i in cart)
        tg_text += "\n\n🛒 <b>Корзина:</b>"
        for item in cart:
            line = item.get('price', 0) * item.get('qty', 1)
            tg_text += f"\n  {item.get('emoji','')} {item.get('name')} × {item.get('qty')} шт. = {line:,} ₽"
        tg_text += f"\n\n💰 <b>Итого: {total:,} ₽</b>"

    send_telegram(os.environ['TELEGRAM_BOT_TOKEN'], tg_text)

    # ── Email ──
    smtp_user = 'hvoia67@yandex.ru'
    smtp_password = os.environ['SMTP_PASSWORD']

    cart_html = ''
    if cart:
        total = sum(i.get('price', 0) * i.get('qty', 1) for i in cart)
        cart_html = '<hr style="border:1px solid #d4e8d4; margin:16px 0;"><h3 style="color:#235523;">Корзина</h3>'
        for item in cart:
            line = item.get('price', 0) * item.get('qty', 1)
            cart_html += f'<div style="padding:6px 0; border-bottom:1px solid #eef5ee;">{item.get("emoji","")} <b>{item.get("name")}</b> × {item.get("qty")} шт. — {line:,} ₽</div>'
        cart_html += f'<div style="margin-top:12px; font-size:18px; font-weight:bold; color:#2d6e2d;">Итого: {total:,} ₽</div>'

    html_body = f"""
<div style="font-family:Arial,sans-serif; max-width:600px; color:#1c421c;">
  <div style="background:#2d6e2d; padding:24px; border-radius:12px 12px 0 0;">
    <h2 style="color:white; margin:0;">🌲 Новая заявка — ХВОЯ</h2>
  </div>
  <div style="background:#f8fbf8; padding:24px; border:1px solid #d4e8d4; border-top:none; border-radius:0 0 12px 12px;">
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="padding:8px 0; color:#5a7a5a; font-size:13px; width:100px;">Имя</td><td style="padding:8px 0; font-weight:bold;">{name}</td></tr>
      <tr><td style="padding:8px 0; color:#5a7a5a; font-size:13px;">Телефон</td><td style="padding:8px 0; font-weight:bold;">{phone}</td></tr>
      <tr><td style="padding:8px 0; color:#5a7a5a; font-size:13px;">Сообщение</td><td style="padding:8px 0;">{message or '—'}</td></tr>
    </table>
    {cart_html}
  </div>
</div>"""

    text_body = f"Новая заявка — ХВОЯ\n\nИмя: {name}\nТелефон: {phone}\nСообщение: {message or '—'}"

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Заявка с сайта: {name} — {phone}'
    msg['From'] = smtp_user
    msg['To'] = smtp_user
    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    with smtplib.SMTP_SSL('smtp.yandex.ru', 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, smtp_user, msg.as_string())

    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({'ok': True})
    }
