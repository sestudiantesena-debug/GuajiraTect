import { type FormEvent, useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import AdminDashboard from './AdminDashboard'

export function App() {
  const [offerStatus, setOfferStatus] = useState<string | null>(null)
  const [isSubmittingOffer, setIsSubmittingOffer] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [adminPassword, setAdminPassword] = useState<string>('')
  const [showLogin, setShowLogin] = useState<boolean>(false)
  const [offerForm, setOfferForm] = useState<{ name: string; category: string; price: string; image_url: string; description: string }>({ name: '', category: '', price: '', image_url: '', description: '' })
  const [products, setProducts] = useState<any[]>([])
  const [productsError, setProductsError] = useState<string>('')
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true)
  const [services, setServices] = useState<any[]>([])
  const [servicesError, setServicesError] = useState<string>('')
  const [loadingServices, setLoadingServices] = useState<boolean>(true)

  const scrollToSection = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true)
      setShowLogin(false)
      setAdminPassword('')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  const logout = () => {
    setIsAdmin(false)
  }

  const handleOfferChange = (key: keyof typeof offerForm, value: string) => {
    setOfferForm((prev) => ({ ...prev, [key]: value }))
  }

  const submitOffer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOfferStatus(null)

    const price = Number(offerForm.price.replace(/[^0-9]/g, ''))
    if (!offerForm.name || !offerForm.category || !price) {
      setOfferStatus('Por favor completa nombre, categoría y precio.')
      return
    }

    setIsSubmittingOffer(true)

    const { error } = await supabase.from('products').insert([
      {
        name: offerForm.name,
        category: offerForm.category,
        image_url: offerForm.image_url || null,
        description: offerForm.description || null,
      },
    ])

    if (error) {
      setOfferStatus(`Error al enviar el producto: ${error.message}`)
    } else {
      setOfferStatus('Producto enviado correctamente. Gracias por tu oferta.')
      setOfferForm({ name: '', category: '', price: '', image_url: '', description: '' })
      setProducts((current) => [
        {
          id: crypto.randomUUID(),
          name: offerForm.name,
          category: offerForm.category,
          price,
          image_url: offerForm.image_url || undefined,
          description: offerForm.description || undefined,
        },
        ...current,
      ])
    }

    setIsSubmittingOffer(false)
  }

  useEffect(() => {
    const loadData = async () => {
      // Load products
      const { data: productsData, error: productsErr } = await supabase
        .from('products')
        .select('id, name, category, price, price_old, description, image_url')
        .order('created_at', { ascending: false })

      if (productsErr) {
        setProductsError(productsErr.message)
      } else if (productsData) {
        setProducts(productsData)
      }

      setLoadingProducts(false)

      // Load services
      const { data: servicesData, error: servicesErr } = await supabase
        .from('services')
        .select('id, title, description, icon, tag')
        .order('created_at', { ascending: true })

      if (servicesErr) {
        setServicesError(servicesErr.message)
      } else if (servicesData) {
        setServices(servicesData)
      }

      setLoadingServices(false)
    }

    loadData()
  }, [])

  return (
    <div className="gt-page">
      {showLogin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(14, 18, 32, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f35 0%, #0e1220 100%)',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(55, 138, 221, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #378add 0%, #00d4ff 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="24" height="24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <circle cx="12" cy="16" r="1" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h3 style={{ color: 'white', margin: '0 0 5px', fontSize: '24px', fontWeight: '600' }}>Acceso Administrador</h3>
              <p style={{ color: '#a0a8c0', margin: 0, fontSize: '14px' }}>Ingresa tu contraseña para acceder al panel de administración</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(55, 138, 221, 0.3)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#378add'}
                onBlur={(e) => (e.target as HTMLElement).style.borderColor = 'rgba(55, 138, 221, 0.3)'}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleLogin}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #378add 0%, #00d4ff 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLElement).style.boxShadow = '0 5px 15px rgba(55, 138, 221, 0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              >
                Ingresar
              </button>
              <button
                onClick={() => setShowLogin(false)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'transparent',
                  color: '#a0a8c0',
                  border: '1px solid rgba(160, 168, 192, 0.3)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.target as HTMLElement).style.borderColor = '#a0a8c0';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.borderColor = 'rgba(160, 168, 192, 0.3)';
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="gt-nav">
        <a className="gt-logo" href="#">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="13 2 13 9 20 9" />
              <path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34" />
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
            </svg>
          </div>
          <span className="logo-name">
            Guajira<span>Tech</span>
          </span>
        </a>
        <div className="gt-nav-links">
          <button className="nav-link active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Inicio</button>
          <button className="nav-link" onClick={() => scrollToSection('.gt-section')}>Servicios</button>
          <button className="nav-link" onClick={() => scrollToSection('.gt-section-dark')}>Productos</button>
          <button className="nav-link" onClick={() => scrollToSection('.offer-card')}>Contacto</button>
        </div>
        <div className="gt-nav-right">
          {isAdmin ? (
            <>
              <span style={{ color: 'white', marginRight: '10px' }}>Admin</span>
              <button className="btn-outline" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <button className="btn-outline" onClick={() => setShowLogin(true)}>Iniciar sesión</button>
          )}
          <button className="btn-primary" onClick={() => scrollToSection('.offer-card')}>Cotizar ahora</button>
        </div>
      </nav>

      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <>
      <section className="gt-hero">
        <div className="hero-decor"></div>
        <div className="hero-decor2"></div>
        <div className="hero-badge">
          <div className="badge-dot"></div>
          Tecnología · La Guajira, Colombia
        </div>
        <h1 className="hero-h1">
          Soluciones tech que <span>impulsan</span> tu negocio
        </h1>
        <p className="hero-sub">
          Reparación de dispositivos, venta de hardware, desarrollo de software,
          aplicaciones móviles y servicios de redes — todo en un solo lugar.
        </p>
        <div className="hero-ctas">
          <button className="btn-hero" onClick={() => document.querySelector('.gt-section')?.scrollIntoView({ behavior: 'smooth' })}>Ver servicios</button>
          <button className="btn-hero-ghost" onClick={() => alert('Para hablar con un experto, contáctanos por WhatsApp o email.')}>Hablar con un experto</button>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">+<span>500</span></div>
            <div className="stat-lbl">Clientes atendidos</div>
          </div>
          <div className="stat">
            <div className="stat-num"><span>6</span></div>
            <div className="stat-lbl">Años de experiencia</div>
          </div>
          <div className="stat">
            <div className="stat-num">+<span>120</span></div>
            <div className="stat-lbl">Proyectos entregados</div>
          </div>
          <div className="stat">
            <div className="stat-num"><span>24</span>h</div>
            <div className="stat-lbl">Soporte disponible</div>
          </div>
        </div>
      </section>

      <section className="gt-section">
        <div className="section-label">Lo que hacemos</div>
        <div className="section-title">Nuestros servicios</div>
        <div className="section-sub">
          Ofrecemos soluciones tecnológicas integrales para personas y empresas en La Guajira y toda Colombia.
        </div>
        <div className="services-grid">
          {loadingServices ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Cargando servicios...</div>
          ) : servicesError ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Error al cargar servicios: {servicesError}</div>
          ) : services.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No hay servicios disponibles.</div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="svc-card">
                <div className="svc-icon ic-blue" dangerouslySetInnerHTML={{ __html: service.icon }} />
                <div className="svc-title">{service.title}</div>
                <div className="svc-desc">{service.description}</div>
                <div className="svc-tag">{service.tag || 'Más información →'}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="gt-section-dark">
        <div className="section-label">Tienda online</div>
        <div className="section-title">Productos destacados</div>
        <div className="section-sub">
          Hardware y accesorios disponibles para entrega inmediata en Maicao y envíos a toda Colombia.
        </div>
        <div className="products-grid">
          {loadingProducts ? (
            <div className="prod-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              Cargando productos...
            </div>
          ) : productsError ? (
            <div className="prod-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              Error al cargar productos: {productsError}
            </div>
          ) : products.length === 0 ? (
            <div className="prod-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              No hay productos disponibles en este momento.
            </div>
          ) : (
            products.slice(0, 8).map((product) => (
              <div key={product.id} className="prod-card">
                <div className="prod-img" style={{ background: '#0e1220' }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#378add" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  )}
                </div>
                <div className="prod-body">
                  <div className="prod-cat">{product.category || 'Producto'}</div>
                  <div className="prod-name">{product.name}</div>
                  <div>
                    <span className="prod-price">${product.price.toLocaleString('es-CO')}</span>
                    {product.price_old ? (
                      <span className="prod-price-old">${product.price_old.toLocaleString('es-CO')}</span>
                    ) : null}
                  </div>
                  <button className="prod-btn" onClick={() => alert(`Producto "${product.name}" agregado al carrito.`)}>Agregar al carrito</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="gt-section">
        <div className="section-label">Ofrece tu producto</div>
        <div className="section-title">Vende con nosotros</div>
        <div className="section-sub">
          Si tienes un producto o accesorio para vender, envíanos los datos y lo revisamos.
        </div>
        <div className="offer-card">
          <form className="offer-form" onSubmit={submitOffer}>
            <div className="offer-grid">
              <label className="offer-field">
                <span className="offer-label">Producto</span>
                <input
                  className="offer-input"
                  type="text"
                  value={offerForm.name}
                  onChange={(event) => handleOfferChange('name', event.target.value)}
                  placeholder="Nombre del producto"
                />
              </label>
              <label className="offer-field">
                <span className="offer-label">Categoría</span>
                <input
                  className="offer-input"
                  type="text"
                  value={offerForm.category}
                  onChange={(event) => handleOfferChange('category', event.target.value)}
                  placeholder="Ej. Laptops, Celulares, Redes"
                />
              </label>
              <label className="offer-field">
                <span className="offer-label">Precio</span>
                <input
                  className="offer-input"
                  type="text"
                  value={offerForm.price}
                  onChange={(event) => handleOfferChange('price', event.target.value)}
                  placeholder="Ej. 1299000"
                />
              </label>
              <label className="offer-field" style={{ gridColumn: '1 / -1' }}>
                <span className="offer-label">Imagen (URL)</span>
                <input
                  className="offer-input"
                  type="url"
                  value={offerForm.image_url}
                  onChange={(event) => handleOfferChange('image_url', event.target.value)}
                  placeholder="https://..."
                />
              </label>
              <label className="offer-field" style={{ gridColumn: '1 / -1' }}>
                <span className="offer-label">Descripción</span>
                <textarea
                  className="offer-textarea"
                  value={offerForm.description}
                  onChange={(event) => handleOfferChange('description', event.target.value)}
                  placeholder="Detalles del producto, estado y características"
                />
              </label>
            </div>
            <div className="offer-actions">
              <button type="submit" className="btn-primary" disabled={isSubmittingOffer}>
                {isSubmittingOffer ? 'Enviando...' : 'Enviar producto'}
              </button>
              <span className="offer-note">Revisaremos tu oferta y la publicaremos pronto.</span>
            </div>
            {offerStatus ? <div className="form-message">{offerStatus}</div> : null}
          </form>
        </div>
      </section>

      <section className="gt-section">
        <div className="section-label">Cómo trabajamos</div>
        <div className="section-title">Proceso simple, resultados reales</div>
        <div className="process-row">
          <div className="proc-step">
            <div className="proc-num">01</div>
            <div className="proc-title">Diagnóstico gratuito</div>
            <div className="proc-desc">Analizamos tu caso sin costo. Evaluamos necesidades y te presentamos la mejor solución.</div>
          </div>
          <div className="proc-step">
            <div className="proc-num">02</div>
            <div className="proc-title">Cotización clara</div>
            <div className="proc-desc">Recibes una propuesta detallada con tiempos, costos y alcance definidos desde el inicio.</div>
          </div>
          <div className="proc-step">
            <div className="proc-num">03</div>
            <div className="proc-title">Ejecución experta</div>
            <div className="proc-desc">Nuestro equipo trabaja con precisión. Te mantenemos informado en cada etapa del proyecto.</div>
          </div>
          <div className="proc-step">
            <div className="proc-num">04</div>
            <div className="proc-title">Entrega y soporte</div>
            <div className="proc-desc">Entregamos con garantía y brindamos soporte continuo para que todo funcione perfectamente.</div>
          </div>
        </div>
      </section>

      <section className="gt-section-dark" style={{ paddingTop: '40px' }}>
        <div className="section-label">¿Por qué elegirnos?</div>
        <div className="section-title">Ventajas GuajiraTech</div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-num">01</div>
            <div className="why-title">Equipo certificado</div>
            <div className="why-desc">Técnicos con certificaciones internacionales y años de experiencia en campo.</div>
          </div>
          <div className="why-card">
            <div className="why-num">02</div>
            <div className="why-title">Garantía en todo</div>
            <div className="why-desc">Todos nuestros servicios y productos incluyen garantía por escrito, sin letra pequeña.</div>
          </div>
          <div className="why-card">
            <div className="why-num">03</div>
            <div className="why-title">Precios justos</div>
            <div className="why-desc">Tarifas competitivas sin costos ocultos. Soluciones accesibles para todo tipo de presupuesto.</div>
          </div>
          <div className="why-card">
            <div className="why-num">04</div>
            <div className="why-title">Atención local</div>
            <div className="why-desc">Presencia física en Maicao con servicio a domicilio en toda La Guajira y envíos nacionales.</div>
          </div>
        </div>
      </section>

      <section className="gt-section">
        <div className="section-label">Lo que dicen nuestros clientes</div>
        <div className="section-title">Testimonios reales</div>
        <div className="testi-grid">
          <div className="testi-card">
            <div className="testi-stars">
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
            </div>
            <div className="testi-text">"Repararon mi laptop en menos de 24 horas. Pensé que la había perdido, pero quedó como nueva. Excelente servicio y muy buen precio."</div>
            <div className="testi-author">
              <div className="testi-av" style={{ background: 'rgba(30,127,255,0.2)', color: '#6ab4ff' }}>CM</div>
              <div>
                <div className="testi-name">Carlos Martínez</div>
                <div className="testi-role">Emprendedor, Maicao</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="testi-stars">
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
            </div>
            <div className="testi-text">"Nos desarrollaron el sistema de gestión para nuestro negocio. Muy profesionales, cumplieron los tiempos y el resultado superó expectativas."</div>
            <div className="testi-author">
              <div className="testi-av" style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>LP</div>
              <div>
                <div className="testi-name">Laura Peñaloza</div>
                <div className="testi-role">Gerente, Distribuidora Guajira</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="testi-stars">
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
              <div className="star"></div>
            </div>
            <div className="testi-text">"Instalaron toda la red de nuestra empresa y las cámaras. Trabajo impecable, limpio y con garantía. Los recomendamos totalmente."</div>
            <div className="testi-author">
              <div className="testi-av" style={{ background: 'rgba(127,119,221,0.2)', color: '#afa9ec' }}>JR</div>
              <div>
                <div className="testi-name">Julio Ríos</div>
                <div className="testi-role">Director, Clínica del Norte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gt-cta-band">
        <div className="cta-band-text">
          <h2>¿Listo para comenzar tu proyecto?</h2>
          <p>Cuéntanos qué necesitas — te respondemos en menos de 2 horas hábiles.</p>
        </div>
        <div className="cta-band-actions">
          <button className="btn-cta-ghost">WhatsApp directo</button>
          <button className="btn-cta-main">Solicitar cotización gratis</button>
        </div>
      </div>

      <footer className="gt-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div className="logo-mark" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="14" height="14">
                  <polyline points="13 2 13 9 20 9" />
                  <path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34" />
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--ff-head)', fontSize: '17px', fontWeight: 800, color: 'var(--gt-text)' }}>
                Guajira<span style={{ color: 'var(--gt-cyan)' }}>Tech</span>
              </span>
            </div>
            <p>Soluciones tecnológicas para personas y empresas en La Guajira y toda Colombia.</p>
          </div>
          <div>
            <div className="footer-col-title">Servicios</div>
            <div className="footer-link">Reparación de equipos</div>
            <div className="footer-link">Desarrollo de software</div>
            <div className="footer-link">Aplicaciones móviles</div>
            <div className="footer-link">Páginas web</div>
            <div className="footer-link">Redes y seguridad</div>
          </div>
          <div>
            <div className="footer-col-title">Productos</div>
            <div className="footer-link">Laptops y computadores</div>
            <div className="footer-link">Celulares y tablets</div>
            <div className="footer-link">Redes y routers</div>
            <div className="footer-link">Almacenamiento</div>
            <div className="footer-link">Accesorios</div>
          </div>
          <div>
            <div className="footer-col-title">Contacto</div>
            <div className="footer-link">Maicao, La Guajira</div>
            <div className="footer-link">+57 300 000 0000</div>
            <div className="footer-link">info@guajiratech.co</div>
            <div className="footer-link">Lun – Sáb: 8am – 6pm</div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 GuajiraTech · Todos los derechos reservados</div>
          <div className="footer-socials">
            <div className="social-btn">
              <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
            </div>
            <div className="social-btn">
              <svg viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
            </div>
            <div className="social-btn">
              <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </div>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  )
}

export default App
