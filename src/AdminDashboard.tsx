import { useEffect, useState, lazy, Suspense } from 'react'
import { supabase } from './lib/supabaseClient'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Bar = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })))
const Doughnut = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Doughnut })))

interface Product {
  id: string
  name: string
  category: string
  price: number
  price_old?: number | null
  description?: string | null
  image_url?: string | null
}

interface Service {
  id: string
  title: string
  description: string
  icon: string
  tag?: string | null
}

interface Client {
  id: string
  name: string
  contact?: string | null
  city?: string | null
  total_orders: number
  total_spent: number
}

interface Order {
  id: string
  client_id?: string | null
  type: string
  item_id: string
  item_name: string
  status: string
  total: number
  technician?: string | null
  created_at: string
}

function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showProductModal, setShowProductModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    price_old: '',
    description: '',
    image_url: '',
    title: '',
    icon: '',
    tag: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, servicesRes, clientsRes, ordersRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
        ])

        if (productsRes.data) setProducts(productsRes.data)
        if (servicesRes.data) setServices(servicesRes.data)
        if (clientsRes.data) setClients(clientsRes.data)
        if (ordersRes.data) setOrders(ordersRes.data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSaveProduct = async () => {
    const price = parseFloat(formData.price.replace(/[^0-9.-]/g, ''))
    const priceOld = formData.price_old ? parseFloat(formData.price_old.replace(/[^0-9.-]/g, '')) : null
    if (!formData.name || !formData.category || !price) {
      alert('Rellena los campos requeridos')
      return
    }
    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update({ 
          name: formData.name,
          category: formData.category,
          price,
          price_old: priceOld,
          description: formData.description,
          image_url: formData.image_url
        }).eq('id', editingProduct.id)
        if (error) throw error
        setProducts(products.map(p => p.id === editingProduct.id 
          ? { ...p, name: formData.name, category: formData.category, price, price_old: priceOld, description: formData.description, image_url: formData.image_url }
          : p))
      } else {
        const { data, error } = await supabase.from('products').insert([{
          name: formData.name,
          category: formData.category,
          price,
          price_old: priceOld,
          description: formData.description,
          image_url: formData.image_url
        }]).select()
        if (error) throw error
        if (data) setProducts([data[0], ...products])
      }
      setShowProductModal(false)
      setEditingProduct(null)
      setFormData({ name: '', category: '', price: '', price_old: '', description: '', image_url: '', title: '', icon: '', tag: '' })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await supabase.from('products').delete().eq('id', id)
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSaveService = async () => {
    if (!formData.title || !formData.description || !formData.icon) {
      alert('Rellena los campos requeridos')
      return
    }
    try {
      if (editingService) {
        await supabase.from('services').update({ 
          title: formData.title,
          description: formData.description,
          icon: formData.icon,
          tag: formData.tag || null
        }).eq('id', editingService.id)
        setServices(services.map(s => s.id === editingService.id 
          ? { ...s, title: formData.title, description: formData.description, icon: formData.icon, tag: formData.tag || null }
          : s))
      } else {
        const { data, error } = await supabase.from('services').insert([{
          title: formData.title,
          description: formData.description,
          icon: formData.icon,
          tag: formData.tag || null
        }]).select()
        if (error) throw error
        if (data) setServices([...services, data[0]])
      }
      setShowServiceModal(false)
      setEditingService(null)
      setFormData({ name: '', category: '', price: '', price_old: '', description: '', image_url: '', title: '', icon: '', tag: '' })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return
    try {
      await supabase.from('services').delete().eq('id', id)
      setServices(services.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        price_old: product.price_old?.toString() || '',
        description: product.description || '',
        image_url: product.image_url || '',
        title: '',
        icon: '',
        tag: ''
      })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', category: '', price: '', price_old: '', description: '', image_url: '', title: '', icon: '', tag: '' })
    }
    setShowProductModal(true)
  }

  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: '',
        category: '',
        price: '',
        price_old: '',
        description: service.description,
        image_url: '',
        title: service.title,
        icon: service.icon,
        tag: service.tag || ''
      })
    } else {
      setEditingService(null)
      setFormData({ name: '', category: '', price: '', price_old: '', description: '', image_url: '', title: '', icon: '', tag: '' })
    }
    setShowServiceModal(true)
  }

  const revenueData = {
    labels: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
    datasets: [
      { label: 'Productos', data: [8.2, 11.5, 7.8, 12.1, 9.4, 14.6], backgroundColor: '#1e7fff', borderRadius: 5, borderSkipped: false },
      { label: 'Servicios', data: [3.1, 4.2, 2.9, 5.3, 4.1, 7.2], backgroundColor: 'rgba(0,212,255,0.22)', borderWidth: 1.5, borderColor: '#00d4ff', borderRadius: 5, borderSkipped: false }
    ]
  }

  const donutData = {
    labels: ['Hardware', 'Reparaciones', 'Software', 'Redes'],
    datasets: [{ data: [38, 27, 18, 17], backgroundColor: ['#1e7fff', '#00d4ff', '#7f77dd', '#1d9e75'], borderWidth: 0 }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { grid: { color: 'rgba(100,160,255,0.06)' }, ticks: { color: '#8899bb' }, border: { color: 'transparent' } }, 
      y: { grid: { color: 'rgba(100,160,255,0.06)' }, ticks: { color: '#8899bb' }, border: { color: 'transparent' } } 
    }
  }

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Cargando dashboard...</div>

  return (
    <div className="adm">
      {/* SIDEBAR */}
      <aside className="adm-side">
        <div className="side-logo">
          <div className="lmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="13 2 13 9 20 9" />
              <path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34" />
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
            </svg>
          </div>
          <span className="lname">Guajira<span>Tech</span></span>
        </div>
        <div className="side-role">
          <div className="role-av">GT</div>
          <div>
            <div className="role-name">Administrador</div>
            <div className="role-tag">Acceso total</div>
          </div>
        </div>
        <div className="side-sep">Principal</div>
        <div className={`side-item ${activeSection === 'dashboard' ? 'on' : ''}`} onClick={() => setActiveSection('dashboard')} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          Dashboard
        </div>
        <div className={`side-item ${activeSection === 'pedidos' ? 'on' : ''}`} onClick={() => setActiveSection('pedidos')} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
          Pedidos <span className="side-badge">{orders.filter(o => o.status === 'pending').length}</span>
        </div>
        <div className={`side-item ${activeSection === 'productos' ? 'on' : ''}`} onClick={() => setActiveSection('productos')} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
          Productos
        </div>
        <div className={`side-item ${activeSection === 'servicios' ? 'on' : ''}`} onClick={() => setActiveSection('servicios')} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M2 12h2M20 12h2" /></svg>
          Servicios <span className="side-badge g">{services.length}</span>
        </div>
        <div className={`side-item ${activeSection === 'clientes' ? 'on' : ''}`} onClick={() => setActiveSection('clientes')} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
          Clientes
        </div>
        <div className="side-bottom">
          <div className="side-item" style={{ color: '#f07070', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Cerrar sesión
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="adm-main">
        <div className="adm-topbar">
          <div>
            <span className="topbar-title">{activeSection === 'dashboard' ? 'Panel de control' : activeSection === 'productos' ? 'Productos' : activeSection === 'servicios' ? 'Servicios' : activeSection === 'pedidos' ? 'Pedidos' : activeSection === 'clientes' ? 'Clientes' : 'Dashboard'}</span>
            <span className="topbar-date">— {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        <div className="adm-body">
          {activeSection === 'dashboard' && (
            <>
              <div className="kpi-grid">
                <div className="kpi"><div className="kpi-label">Ingresos del mes</div><div className="kpi-val">$18.4M <span className="kpi-trend up">+12%</span></div><div className="kpi-sub">COP · Meta: $22M</div><div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: '84%', background: 'var(--gt-blue)' }}></div></div></div>
                <div className="kpi"><div className="kpi-label">Pedidos totales</div><div className="kpi-val">{orders.length} <span className="kpi-trend up">+8%</span></div><div className="kpi-sub">Este mes · {orders.filter(o => o.status === 'pending').length} pendientes</div><div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: '65%', background: 'var(--gt-cyan)' }}></div></div></div>
                <div className="kpi"><div className="kpi-label">Servicios activos</div><div className="kpi-val">{services.length} <span className="kpi-trend dn">-3%</span></div><div className="kpi-sub">En proceso hoy</div><div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: '54%', background: '#1d9e75' }}></div></div></div>
                <div className="kpi"><div className="kpi-label">Clientes nuevos</div><div className="kpi-val">{clients.length} <span className="kpi-trend up">+21%</span></div><div className="kpi-sub">Vs. mes anterior</div><div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: '72%', background: '#ba7517' }}></div></div></div>
              </div>
              <div className="two-col">
                <div className="panel"><div className="panel-head"><span className="panel-title">Ingresos — últimos 6 meses</span></div><div style={{ position: 'relative', width: '100%', height: '200px' }}><Suspense fallback={<div>Cargando...</div>}><Bar data={revenueData} options={chartOptions} /></Suspense></div></div>
                <div className="donut-panel"><div className="panel-head"><span className="panel-title">Ventas por categoría</span></div><div className="donut-body"><div className="donut-canvas-wrap"><Suspense fallback={<div>Cargando...</div>}><Doughnut data={donutData} options={{ responsive: false, plugins: { legend: { display: false } }, cutout: '68%' }} /></Suspense></div></div></div>
              </div>
            </>
          )}

          {activeSection === 'productos' && (
            <div className="full-panel">
              <div className="panel-head">
                <span className="panel-title">Gestión de productos</span>
                <button className="add-btn" onClick={() => openProductModal()} style={{ cursor: 'pointer' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Nuevo producto
                </button>
              </div>
              <table className="adm-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Acciones</th></tr></thead><tbody>{products.map((p) => (<tr key={p.id}><td className="td-name">{p.name}</td><td>{p.category}</td><td>${p.price.toLocaleString('es-CO')}</td><td><div className="td-act"><button className="act-btn" onClick={() => openProductModal(p)}>Editar</button><button className="act-btn danger" onClick={() => handleDeleteProduct(p.id)}>Eliminar</button></div></td></tr>))}</tbody></table>
            </div>
          )}

          {activeSection === 'servicios' && (
            <div className="full-panel">
              <div className="panel-head">
                <span className="panel-title">Gestión de servicios</span>
                <button className="add-btn" onClick={() => openServiceModal()} style={{ cursor: 'pointer' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Nuevo servicio
                </button>
              </div>
              <table className="adm-table"><thead><tr><th>Servicio</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody>{services.map((s) => (<tr key={s.id}><td className="td-name">{s.title}</td><td style={{ color: 'var(--muted)' }}>{s.description}</td><td><div className="td-act"><button className="act-btn" onClick={() => openServiceModal(s)}>Editar</button><button className="act-btn danger" onClick={() => handleDeleteService(s.id)}>Eliminar</button></div></td></tr>))}</tbody></table>
            </div>
          )}

          {activeSection === 'clientes' && (
            <div className="full-panel">
              <div className="panel-head"><span className="panel-title">Clientes registrados</span></div>
              <table className="adm-table"><thead><tr><th>Nombre</th><th>Contacto</th><th>Ciudad</th><th>Pedidos</th><th>Total gastado</th></tr></thead><tbody>{clients.map((c) => (<tr key={c.id}><td className="td-name">{c.name}</td><td>{c.contact || '-'}</td><td>{c.city || '-'}</td><td>{c.total_orders}</td><td style={{ color: 'var(--gt-cyan)' }}>${c.total_spent.toLocaleString('es-CO')}</td></tr>))}</tbody></table>
            </div>
          )}

          {activeSection === 'pedidos' && (
            <div className="full-panel">
              <div className="panel-head"><span className="panel-title">Pedidos</span></div>
              <table className="adm-table"><thead><tr><th>Cliente</th><th>Producto/Servicio</th><th>Estado</th><th>Total</th></tr></thead><tbody>{orders.map((o) => (<tr key={o.id}><td className="td-name">{clients.find(c => c.id === o.client_id)?.name || 'Desconocido'}</td><td>{o.item_name}</td><td><span className={`badge b-${o.status === 'completed' ? 'green' : o.status === 'in_progress' ? 'amber' : 'blue'}`}>{o.status}</span></td><td>${o.total.toLocaleString('es-CO')}</td></tr>))}</tbody></table>
            </div>
          )}
        </div>
      </div>

      {showProductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--gt-surface)', border: '0.5px solid var(--gt-border)', borderRadius: '12px', padding: '28px', maxWidth: '500px', width: '90%', color: 'var(--gt-text)' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '0.5px solid var(--gt-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              <input type="text" placeholder="Categoría" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '0.5px solid var(--gt-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              <input type="number" placeholder="Precio" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '0.5px solid var(--gt-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              <textarea placeholder="Descripción" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '0.5px solid var(--gt-border)', background: 'rgba(255,255,255,0.05)', color: 'white', minHeight: '80px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleSaveProduct} style={{ flex: 1, padding: '10px', background: 'var(--gt-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Guardar</button>
                <button onClick={() => setShowProductModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--gt-muted)', border: '0.5px solid var(--gt-border)', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--gt-surface)', border: '0.5px solid var(--gt-border)', borderRadius: '12px', padding: '28px', maxWidth: '500px', width: '90%', color: 'var(--gt-text)' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>{editingService ? 'Editar servicio' : 'Nuevo servicio'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Nombre del servicio" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '0.5px solid var(--gt-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              <textarea placeholder="Descripción" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '0.5px solid var(--gt-border)', background: 'rgba(255,255,255,0.05)', color: 'white', minHeight: '80px' }} />
              <input type="text" placeholder="Icono (emoji o código)" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '0.5px solid var(--gt-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleSaveService} style={{ flex: 1, padding: '10px', background: 'var(--gt-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Guardar</button>
                <button onClick={() => setShowServiceModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--gt-muted)', border: '0.5px solid var(--gt-border)', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
