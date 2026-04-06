import json
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта питомника ХВОЯ на почту hvoia67@yandex.ru"""

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

    smtp_user = 'hvoia67@yandex.ru'
    smtp_password = os.environ['SMTP_PASSWORD']

    cart_lines = ''
    if cart:
        cart_lines = '\n\nСостав корзины:\n'
        total = 0
        for item in cart:
            line_total = item.get('price', 0) * item.get('qty', 1)
            total += line_total
            cart_lines += f"  • {item.get('name')} × {item.get('qty')} шт. = {line_total:,} ₽\n"
        cart_lines += f"\nИтого: {total:,} ₽"

    text_body = f"""Новая заявка с сайта питомника ХВОЯ

Имя: {name}
Телефон: {phone}
Сообщение: {message or '—'}{cart_lines}
"""

    html_body = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; color: #1c421c;">
  <div style="background: #2d6e2d; padding: 24px; border-radius: 12px 12px 0 0;">
    <h2 style="color: white; margin: 0;">🌲 Новая заявка — ХВОЯ</h2>
  </div>
  <div style="background: #f8fbf8; padding: 24px; border: 1px solid #d4e8d4; border-top: none; border-radius: 0 0 12px 12px;">
    <table style="width:100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #5a7a5a; font-size: 13px;">Имя</td><td style="padding: 8px 0; font-weight: bold;">{name}</td></tr>
      <tr><td style="padding: 8px 0; color: #5a7a5a; font-size: 13px;">Телефон</td><td style="padding: 8px 0; font-weight: bold;">{phone}</td></tr>
      <tr><td style="padding: 8px 0; color: #5a7a5a; font-size: 13px;">Сообщение</td><td style="padding: 8px 0;">{message or '—'}</td></tr>
    </table>
    {'<hr style="border: 1px solid #d4e8d4; margin: 16px 0;"><h3 style="color: #235523;">Корзина</h3>' + ''.join(f'<div style="padding: 6px 0; border-bottom: 1px solid #eef5ee;">{item.get("emoji","")} <b>{item.get("name")}</b> × {item.get("qty")} шт. — {item.get("price",0)*item.get("qty",1):,} ₽</div>' for item in cart) + f'<div style="margin-top:12px; font-size:18px; font-weight:bold; color:#2d6e2d;">Итого: {sum(i.get("price",0)*i.get("qty",1) for i in cart):,} ₽</div>' if cart else ''}
  </div>
</div>
"""

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
