import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

/* ─── Types ─── */
interface Plant {
  id: number;
  name: string;
  latin: string;
  price: number;
  height: string;
  age: string;
  emoji: string;
  badge?: string;
  gradient: string;
}

interface CartItem extends Plant {
  qty: number;
}

/* ─── Data ─── */
const PLANTS: Plant[] = [
  { id: 1, name: "Ель обыкновенная", latin: "Picea abies", price: 1800, height: "80–120 см", age: "5 лет", emoji: "🌲", badge: "Хит", gradient: "from-green-50 to-emerald-50" },
  { id: 2, name: "Сосна горная", latin: "Pinus mugo", price: 2400, height: "60–80 см", age: "4 года", emoji: "🌳", gradient: "from-emerald-50 to-teal-50" },
  { id: 3, name: "Туя западная", latin: "Thuja occidentalis", price: 1200, height: "100–150 см", age: "3 года", emoji: "🌿", badge: "Новинка", gradient: "from-lime-50 to-green-50" },
  { id: 4, name: "Можжевельник казацкий", latin: "Juniperus sabina", price: 950, height: "40–60 см", age: "3 года", emoji: "🌱", gradient: "from-green-50 to-emerald-50" },
  { id: 5, name: "Пихта корейская", latin: "Abies koreana", price: 3200, height: "50–70 см", age: "6 лет", emoji: "🎄", badge: "Редкость", gradient: "from-teal-50 to-cyan-50" },
  { id: 6, name: "Лиственница европейская", latin: "Larix decidua", price: 2100, height: "150–200 см", age: "7 лет", emoji: "🌾", gradient: "from-yellow-50 to-lime-50" },
];

const SLIDER_ITEMS = [
  { title: "Питомник хвойных растений", subtitle: "С 2009 года выращиваем и продаём хвойные деревья и кустарники. Более 40 видов растений.", cta: "Смотреть каталог", bg: "from-[#1c421c] via-[#2d6e2d] to-[#3a8a3a]" },
  { title: "Живые ели к Новому году", subtitle: "Натуральные ели с комом земли — дерево переживёт праздник и украсит ваш сад.", cta: "Заказать ель", bg: "from-[#163416] via-[#235523] to-[#2d6e2d]" },
  { title: "Профессиональное озеленение", subtitle: "Проектируем и высаживаем хвойные композиции для частных участков и коммерческих объектов.", cta: "Узнать подробнее", bg: "from-[#1a3a2a] via-[#2a5a3a] to-[#3a7a4a]" },
];

const ADVANTAGES = [
  { icon: "Sprout", title: "Собственный питомник", text: "Выращиваем все растения сами — никаких перекупщиков. Контроль качества на каждом этапе." },
  { icon: "Shield", title: "Гарантия приживаемости", text: "Даём гарантию 1 год на все саженцы. При гибели по нашей вине — бесплатная замена." },
  { icon: "Truck", title: "Доставка по всей России", text: "Бережная транспортировка с сохранением кома земли. Привезём прямо на участок." },
  { icon: "Users", title: "Консультация специалиста", text: "Наши агрономы помогут подобрать растения под ваш климат, почву и дизайн." },
];

const PROCESS_STEPS = [
  { num: "01", title: "Семенной материал", text: "Используем семена только от проверенных производителей Европы и России. Тщательный отбор с учётом климатических зон." },
  { num: "02", title: "Выращивание в теплице", text: "Первые 1–2 года саженцы растут в контролируемых условиях. Оптимальная температура, влажность, освещение." },
  { num: "03", title: "Доращивание в поле", text: "Растения переезжают в открытый грунт питомника. Адаптируются к местному климату 3–5 лет." },
  { num: "04", title: "Упаковка и отгрузка", text: "Каждое растение аккуратно упаковывается с защитой корневой системы. Маркировка и паспорт растения." },
];

const GALLERY = [
  { emoji: "🌲", label: "Ели 5 лет", color: "#2d6e2d" },
  { emoji: "🌳", label: "Сосны горные", color: "#3a8a3a" },
  { emoji: "🎄", label: "Пихты корейские", color: "#235523" },
  { emoji: "🌿", label: "Туи западные", color: "#4a9a4a" },
  { emoji: "🌱", label: "Можжевельники", color: "#1c421c" },
  { emoji: "🌾", label: "Лиственницы", color: "#5aaa5a" },
];

/* ─── Hook: fade-in on scroll ─── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Cart Drawer ─── */
function CartDrawer({ cart, onClose, onQty, onRemove }: {
  cart: CartItem[];
  onClose: () => void;
  onQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl" style={{ animation: "slideInRight 0.3s ease" }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-2xl font-semibold" style={{ color: "#235523" }}>Корзина</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <span className="text-6xl">🛒</span>
            <p className="font-body">Корзина пуста</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.height}</p>
                    <p className="font-semibold mt-1" style={{ color: "#2d6e2d" }}>{(item.price * item.qty).toLocaleString()} ₽</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onQty(item.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-sm font-bold">−</button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => onQty(item.id, +1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-sm font-bold">+</button>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-body text-gray-500">Итого:</span>
                <span className="font-display text-2xl font-semibold" style={{ color: "#235523" }}>{total.toLocaleString()} ₽</span>
              </div>
              <button className="w-full font-body font-semibold py-4 rounded-xl transition-colors text-base text-white" style={{ background: "#2d6e2d" }}>
                Оформить заказ
              </button>
              <p className="text-xs text-center text-gray-400">Доставка рассчитывается отдельно</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function Index() {
  const [slide, setSlide] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDER_ITEMS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const addToCart = useCallback((plant: Plant) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === plant.id);
      if (exists) return prev.map(i => i.id === plant.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...plant, qty: 1 }];
    });
    setAddedId(plant.id);
    setTimeout(() => setAddedId(null), 900);
  }, []);

  const changeQty = useCallback((id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const refAdv = useFadeIn();
  const refAbout = useFadeIn();
  const refProcess = useFadeIn();
  const refCatalog = useFadeIn();
  const refGallery = useFadeIn();
  const refContacts = useFadeIn();

  const s = SLIDER_ITEMS[slide];

  return (
    <div className="min-h-screen font-body" style={{ background: "#f4f6f4" }}>

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-md border-b shadow-sm" style={{ borderColor: "#d4e8d4" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="text-2xl">🌲</span>
            <span className="font-display text-2xl font-semibold tracking-wide" style={{ color: "#235523" }}>ХВОЯ</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {[["#catalog", "Каталог"], ["#about", "О нас"], ["#process", "Как растём"], ["#gallery", "Галерея"], ["#contacts", "Контакты"]].map(([href, label]) => (
              <a key={href} href={href} className="font-body text-sm text-gray-500 hover:text-green-700 transition-colors">{label}</a>
            ))}
          </nav>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 text-white px-5 py-2.5 rounded-full transition-all font-body text-sm font-medium hover:opacity-90"
            style={{ background: "#2d6e2d" }}
          >
            <Icon name="ShoppingCart" size={16} />
            <span className="hidden sm:inline">Корзина</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── HERO SLIDER ── */}
      <section className="relative h-screen overflow-hidden">
        <div key={slide} className={`absolute inset-0 bg-gradient-to-br ${s.bg}`} style={{ animation: "fadeSlide 0.8s ease" }} />
        <style>{`@keyframes fadeSlide { from { opacity:0.4; } to { opacity:1; } }`}</style>

        {/* Tree silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end opacity-15 pointer-events-none select-none">
          {["🌲", "🎄", "🌲", "🌲", "🎄", "🌲", "🌲"].map((e, i) => (
            <span key={i} className="text-7xl sm:text-9xl" style={{ marginBottom: i % 2 ? "-0.5rem" : "0" }}>{e}</span>
          ))}
        </div>

        {/* Glow */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-20" style={{ background: "#8fc98f", filter: "blur(80px)" }} />

        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 pt-16">
            <div className="max-w-2xl" style={{ animation: "fadeIn 0.7s ease both" }}>
              <div className="inline-flex items-center gap-2 text-white/80 text-sm px-4 py-1.5 rounded-full mb-6 font-body" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                Питомник работает с 2009 года
              </div>
              <h1 className="font-display text-5xl sm:text-7xl font-light text-white leading-tight mb-6">
                {s.title}
              </h1>
              <p className="font-body text-lg leading-relaxed mb-8 max-w-lg" style={{ color: "rgba(255,255,255,0.72)" }}>
                {s.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#catalog" className="inline-flex items-center gap-2 bg-white font-body font-semibold px-7 py-3.5 rounded-full transition-all hover:scale-105 shadow-lg" style={{ color: "#235523" }}>
                  {s.cta}
                  <Icon name="ArrowRight" size={16} />
                </a>
                <a href="#contacts" className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white/10 font-body px-7 py-3.5 rounded-full transition-colors">
                  Связаться
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Slider dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDER_ITEMS.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-white" : "w-2 bg-white/35"}`} />
          ))}
        </div>
      </section>

      {/* ── ADVANTAGES ── */}
      <section id="advantages" className="py-24 bg-white">
        <div ref={refAdv} className="section-fade max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-body text-sm uppercase tracking-widest mb-3" style={{ color: "#5aaa5a" }}>Почему выбирают нас</p>
            <h2 className="font-display text-4xl sm:text-5xl font-light" style={{ color: "#1c421c" }}>Наши преимущества</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVANTAGES.map((a, i) => (
              <div key={i} className="group p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md" style={{ background: "#f8fbf8", borderColor: "#e0ede0" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors" style={{ background: "#e0f0e0" }}>
                  <Icon name={a.icon as "Sprout" | "Shield" | "Truck" | "Users"} size={22} style={{ color: "#2d6e2d" }} />
                </div>
                <h3 className="font-display text-xl font-medium mb-3" style={{ color: "#1c421c" }}>{a.title}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 overflow-hidden" style={{ background: "#1c421c" }}>
        <div ref={refAbout} className="section-fade max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-sm uppercase tracking-widest mb-4" style={{ color: "#8fc98f" }}>О нас</p>
              <h2 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight mb-6">
                15 лет выращиваем<br /><em>настоящие деревья</em>
              </h2>
              <p className="font-body leading-relaxed mb-5" style={{ color: "#b8dab8" }}>
                Питомник ХВОЯ расположен в Подмосковье на площади 12 гектаров. Мы специализируемся исключительно на хвойных культурах — это наша страсть и главная экспертиза.
              </p>
              <p className="font-body leading-relaxed mb-10" style={{ color: "#b8dab8" }}>
                За эти годы мы высадили более 50 000 деревьев по всей России — от частных садов до городских парков. Каждое растение выращено с любовью и вниманием.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[["50 000+", "Растений высажено"], ["40+", "Видов и сортов"], ["15", "Лет на рынке"]].map(([num, label]) => (
                  <div key={label}>
                    <p className="font-display text-3xl font-semibold mb-1" style={{ color: "#8fc98f" }}>{num}</p>
                    <p className="font-body text-xs leading-tight" style={{ color: "#6a9a6a" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { bg: "#2d6e2d", emoji: "🌲", label: "Наш питомник" },
                { bg: "#3a8a3a", emoji: "🌱", label: "Молодые саженцы" },
                { bg: "#235523", emoji: "👨‍🌾", label: "Наша команда" },
                { bg: "#4a9a4a", emoji: "🏡", label: "Ваш сад" },
              ].map((card, i) => (
                <div key={i} className="rounded-2xl aspect-square flex flex-col items-center justify-center gap-3 group hover:scale-105 transition-transform duration-300 cursor-pointer" style={{ background: card.bg }}>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{card.emoji}</span>
                  <span className="font-body text-sm" style={{ color: "#c0e0c0" }}>{card.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" className="py-24" style={{ background: "#faf8f4" }}>
        <div ref={refProcess} className="section-fade max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-body text-sm uppercase tracking-widest mb-3" style={{ color: "#5aaa5a" }}>Как мы работаем</p>
            <h2 className="font-display text-4xl sm:text-5xl font-light" style={{ color: "#1c421c" }}>Путь от семени до сада</h2>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px" style={{ background: "linear-gradient(to right, transparent, #8fc98f, transparent)" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PROCESS_STEPS.map((step, i) => (
                <div key={i} className="text-center group">
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 bg-white border-2 rounded-full flex items-center justify-center transition-all shadow-sm group-hover:shadow-md" style={{ borderColor: "#c0e0c0" }}>
                      <span className="font-display text-xl font-semibold" style={{ color: "#3a8a3a" }}>{step.num}</span>
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-medium mb-3" style={{ color: "#1c421c" }}>{step.title}</h3>
                  <p className="font-body text-sm text-gray-500 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section id="catalog" className="py-24 bg-white">
        <div ref={refCatalog} className="section-fade max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-body text-sm uppercase tracking-widest mb-3" style={{ color: "#5aaa5a" }}>Наши растения</p>
            <h2 className="font-display text-4xl sm:text-5xl font-light" style={{ color: "#1c421c" }}>Каталог саженцев</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLANTS.map(plant => (
              <div key={plant.id} className={`bg-gradient-to-br ${plant.gradient} rounded-2xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{plant.emoji}</span>
                  {plant.badge && (
                    <span className="text-xs font-body font-semibold text-white px-3 py-1 rounded-full" style={{ background: "#2d6e2d" }}>{plant.badge}</span>
                  )}
                </div>
                <h3 className="font-display text-xl font-medium mb-1" style={{ color: "#1c421c" }}>{plant.name}</h3>
                <p className="font-body text-xs italic text-gray-400 mb-4">{plant.latin}</p>
                <div className="flex gap-5 mb-5">
                  <div className="font-body text-xs text-gray-600">
                    <span className="text-gray-400 block">Высота</span>
                    <span className="font-medium">{plant.height}</span>
                  </div>
                  <div className="font-body text-xs text-gray-600">
                    <span className="text-gray-400 block">Возраст</span>
                    <span className="font-medium">{plant.age}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-semibold" style={{ color: "#235523" }}>{plant.price.toLocaleString()} ₽</span>
                  <button
                    onClick={() => addToCart(plant)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
                    style={{
                      background: addedId === plant.id ? "#22c55e" : "#2d6e2d",
                      transform: addedId === plant.id ? "scale(0.95)" : "scale(1)"
                    }}
                  >
                    <Icon name={addedId === plant.id ? "Check" : "Plus"} size={14} />
                    {addedId === plant.id ? "Добавлено!" : "В корзину"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="py-24" style={{ background: "#f0f4f0" }}>
        <div ref={refGallery} className="section-fade max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-body text-sm uppercase tracking-widest mb-3" style={{ color: "#5aaa5a" }}>Наша работа</p>
            <h2 className="font-display text-4xl sm:text-5xl font-light" style={{ color: "#1c421c" }}>Фото и видео</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map((item, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="text-6xl sm:text-8xl group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}>
                  <p className="font-body text-sm font-medium" style={{ color: item.color }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="font-body text-sm text-gray-400">Видео из питомника — по запросу. Напишите нам!</p>
          </div>
        </div>
      </section>

      {/* ── CONTACTS ── */}
      <section id="contacts" className="py-24" style={{ background: "#163416" }}>
        <div ref={refContacts} className="section-fade max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="font-body text-sm uppercase tracking-widest mb-4" style={{ color: "#8fc98f" }}>Свяжитесь с нами</p>
              <h2 className="font-display text-4xl sm:text-5xl font-light text-white mb-6">
                Готовы ответить<br />на все вопросы
              </h2>
              <p className="font-body leading-relaxed mb-10" style={{ color: "#9ab89a" }}>
                Оставьте заявку или позвоните нам — поможем подобрать растения, рассчитаем доставку и ответим на все вопросы.
              </p>
              <div className="space-y-5">
                {[
                  { icon: "Phone", label: "Телефон", value: "8 (920) 320-09-01" },
                  { icon: "Mail", label: "Email", value: "hvoia67@yandex.ru" },
                  { icon: "MapPin", label: "Адрес", value: "Смоленская область, Смоленский район, д. Пенеснарь" },
                  { icon: "Clock", label: "Режим работы", value: "Пн–Сб: 9:00–18:00" },
                ].map(c => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#2d6e2d" }}>
                      <Icon name={c.icon as "Phone" | "Mail" | "MapPin" | "Clock"} size={18} style={{ color: "#8fc98f" }} />
                    </div>
                    <div>
                      <p className="font-body text-xs mb-0.5" style={{ color: "#6a8a6a" }}>{c.label}</p>
                      <p className="font-body" style={{ color: "#d0e8d0" }}>{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-8 border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "#2d6e2d" }}>
              <h3 className="font-display text-2xl font-medium text-white mb-6">Оставить заявку</h3>
              <div className="space-y-4">
                {[
                  { label: "Ваше имя", type: "text", placeholder: "Иван Иванов" },
                  { label: "Телефон", type: "tel", placeholder: "+7 (___) ___-__-__" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="font-body text-xs uppercase tracking-wider mb-2 block" style={{ color: "#8fc98f" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} className="w-full border rounded-xl px-4 py-3 font-body text-white placeholder-green-900 focus:outline-none transition-colors" style={{ background: "rgba(255,255,255,0.08)", borderColor: "#2d6e2d" }} />
                  </div>
                ))}
                <div>
                  <label className="font-body text-xs uppercase tracking-wider mb-2 block" style={{ color: "#8fc98f" }}>Сообщение</label>
                  <textarea rows={3} placeholder="Интересуют ели 1–1.5 м для живой изгороди..." className="w-full border rounded-xl px-4 py-3 font-body text-white placeholder-green-900 focus:outline-none transition-colors resize-none" style={{ background: "rgba(255,255,255,0.08)", borderColor: "#2d6e2d" }} />
                </div>
                <button className="w-full font-body font-semibold py-4 rounded-xl transition-all text-base hover:opacity-90" style={{ background: "#8fc98f", color: "#1c421c" }}>
                  Отправить заявку
                </button>
                <p className="text-xs text-center" style={{ color: "#4a6a4a" }}>Ответим в течение часа в рабочее время</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10" style={{ background: "#0e280e" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌲</span>
            <span className="font-display text-xl" style={{ color: "#6a9a6a" }}>ХВОЯ</span>
          </div>
          <p className="font-body text-xs" style={{ color: "#3a5a3a" }}>© 2009–2026 Питомник ХВОЯ. Все права защищены.</p>
          <div className="flex gap-4">
            {[["#catalog", "Каталог"], ["#about", "О нас"], ["#contacts", "Контакты"]].map(([href, label]) => (
              <a key={href} href={href} className="font-body text-xs transition-colors hover:opacity-70" style={{ color: "#4a7a4a" }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onQty={changeQty} onRemove={removeFromCart} />
      )}

      {/* ── FLOATING CART (mobile) ── */}
      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 md:hidden"
          style={{ background: "#2d6e2d" }}
        >
          <Icon name="ShoppingCart" size={22} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {cartCount}
          </span>
        </button>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}