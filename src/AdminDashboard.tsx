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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, servicesRes, clientsRes, ordersRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
        ])

        if (productsRes.error) {
          console.error('Error al cargar productos:', productsRes.error.message)
        } else {
          setProducts(productsRes.data || [])
        }

        if (servicesRes.error) {
          console.error('Error al cargar servicios:', servicesRes.error.message)
        } else {
          setServices(servicesRes.data || [])
        }

        if (clientsRes.error) {
          console.error('Error al cargar clientes:', clientsRes.error.message)
        } else {
          setClients(clientsRes.data || [])
        }

        if (ordersRes.error) {
          console.error('Error al cargar pedidos:', ordersRes.error.message)
        } else {
          setOrders(ordersRes.data || [])
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Mock data for charts (in a real app, calculate from orders)
  const revenueData = {
    labels: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
    datasets: [
      {
        label: 'Productos',
        data: [8.2, 11.5, 7.8, 12.1, 9.4, 14.6],
        backgroundColor: '#1e7fff',
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: 'Servicios',
        data: [3.1, 4.2, 2.9, 5.3, 4.1, 7.2],
        backgroundColor: 'rgba(0,212,255,0.22)',
        borderWidth: 1.5,
        borderColor: '#00d4ff',
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  }

  const donutData = {
    labels: ['Hardware', 'Reparaciones', 'Software', 'Redes'],
    datasets: [{
      data: [38, 27, 18, 17],
      backgroundColor: ['#1e7fff', '#00d4ff', '#7f77dd', '#1d9e75'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e2540',
        titleColor: '#eef2ff',
        bodyColor: '#8899bb',
        borderColor: 'rgba(100,160,255,0.2)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => ` $${context.raw.toFixed(1)}M COP`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(100,160,255,0.06)' },
        ticks: { color: '#8899bb', font: { size: 11 } },
        border: { color: 'transparent' },
      },
      y: {
        grid: { color: 'rgba(100,160,255,0.06)' },
        ticks: {
          color: '#8899bb',
          font: { size: 11 },
          callback: (value: any) => `$${value}M`,
        },
        border: { color: 'transparent' },
      },
    },
  }

  const donutOptions = {
    responsive: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e2540',
        titleColor: '#eef2ff',
        bodyColor: '#8899bb',
        borderColor: 'rgba(100,160,255,0.2)',
        borderWidth: 1,
      },
    },
    cutout: '68%',
  }

  if (loading) {
    return <div style={{ padding: '20px', color: 'white' }}>Cargando dashboard...</div>
  }

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
          <span className="lname">
            Guajira<span>Tech</span>
          </span>
        </div>
        <div className="side-role">
          <div className="role-av">GT</div>
          <div>
            <div className="role-name">Administrador</div>
            <div className="role-tag">Acceso total</div>
          </div>
        </div>
        <div className="side-sep">Principal</div>
        <div className="side-item on">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </div>
        <div className="side-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Pedidos
          <span className="side-badge">{orders.filter(o => o.status === 'pending').length}</span>
        </div>
        <div className="side-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          Productos
        </div>
        <div className="side-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M2 12h2M20 12h2" />
          </svg>
          Servicios
          <span className="side-badge g">{services.length}</span>
        </div>
        <div className="side-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          Clientes
        </div>
        <div className="side-sep">Gestión</div>
        <div className="side-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
          Reportes
        </div>
        <div className="side-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
          </svg>
          Inventario
        </div>
        <div className="side-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Mensajes
          <span className="side-badge">5</span>
        </div>
        <div className="side-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M2 12h2M20 12h2" />
          </svg>
          Ajustes
        </div>
        <div className="side-bottom">
          <div className="side-item" style={{ color: '#f07070' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="adm-main">
        <div className="adm-topbar">
          <div>
            <span className="topbar-title">Panel de control</span>
            <span className="topbar-date">— {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="tb-search">
            <input type="text" placeholder="Buscar pedidos, clientes..." />
          </div>
          <div className="tb-notif">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <div className="notif-dot"></div>
          </div>
        </div>

        <div className="adm-body">
          {/* KPI */}
          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Ingresos del mes</div>
              <div className="kpi-val">$18.4M <span className="kpi-trend up">+12%</span></div>
              <div className="kpi-sub">COP · Meta: $22M</div>
              <div className="kpi-bar">
                <div className="kpi-bar-fill" style={{ width: '84%', background: 'var(--blue)' }}></div>
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Pedidos totales</div>
              <div className="kpi-val">{orders.length} <span className="kpi-trend up">+8%</span></div>
              <div className="kpi-sub">Este mes · {orders.filter(o => o.status === 'pending').length} pendientes</div>
              <div className="kpi-bar">
                <div className="kpi-bar-fill" style={{ width: '65%', background: 'var(--cyan)' }}></div>
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Servicios activos</div>
              <div className="kpi-val">{services.length} <span className="kpi-trend dn">-3%</span></div>
              <div className="kpi-sub">{orders.filter(o => o.type === 'service' && o.status === 'in_progress').length} en proceso hoy</div>
              <div className="kpi-bar">
                <div className="kpi-bar-fill" style={{ width: '54%', background: 'var(--green)' }}></div>
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Clientes nuevos</div>
              <div className="kpi-val">{clients.length} <span className="kpi-trend up">+21%</span></div>
              <div className="kpi-sub">Vs. mes anterior</div>
              <div className="kpi-bar">
                <div className="kpi-bar-fill" style={{ width: '72%', background: 'var(--amber)' }}></div>
              </div>
            </div>
          </div>

          {/* CHART + DONUT */}
          <div className="two-col">
            {/* Barras */}
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">Ingresos — últimos 6 meses</span>
                <span className="panel-action">Ver reporte</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '11px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1e7fff', display: 'inline-block' }}></span>Productos
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', border: '1.5px dashed #00d4ff', display: 'inline-block' }}></span>Servicios
                </span>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                <Suspense fallback={<div>Cargando gráfico...</div>}>
                  <Bar data={revenueData} options={chartOptions} />
                </Suspense>
              </div>
            </div>

            {/* DONUT */}
            <div className="donut-panel">
              <div className="panel-head">
                <span className="panel-title">Ventas por categoría</span>
                <span className="panel-action">Detalles</span>
              </div>
              <div className="donut-body">
                <div className="donut-canvas-wrap">
                  <Suspense fallback={<div>Cargando gráfico...</div>}>
                    <Doughnut data={donutData} options={donutOptions} />
                  </Suspense>
                </div>
                <div className="donut-legend">
                  <div className="leg-item">
                    <span className="leg-left">
                      <span className="leg-dot" style={{ background: '#1e7fff' }}></span>Hardware
                    </span>
                    <span className="leg-val">38%</span>
                  </div>
                  <div className="leg-item">
                    <span className="leg-left">
                      <span className="leg-dot" style={{ background: '#00d4ff' }}></span>Reparaciones
                    </span>
                    <span className="leg-val">27%</span>
                  </div>
                  <div className="leg-item">
                    <span className="leg-left">
                      <span className="leg-dot" style={{ background: '#7f77dd' }}></span>Software
                    </span>
                    <span className="leg-val">18%</span>
                  </div>
                  <div className="leg-item">
                    <span className="leg-left">
                      <span className="leg-dot" style={{ background: '#1d9e75' }}></span>Redes
                    </span>
                    <span className="leg-val">17%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ALERTAS */}
          <div className="panel" style={{ marginBottom: '14px' }}>
            <div className="panel-head">
              <span className="panel-title">Alertas y notificaciones</span>
              <span className="panel-action">Marcar todas como leídas</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="alert-item">
                <div className="alert-icon ai-red">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f07070" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="alert-body">
                  <div className="alert-title">Stock bajo — SSD NVMe 1TB</div>
                  <div className="alert-sub">Quedan 2 unidades. Considera reabastecerte pronto.</div>
                </div>
                <div className="alert-time">hace 10 min</div>
              </div>
              <div className="alert-item">
                <div className="alert-icon ai-amber">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#e8a430" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="alert-body">
                  <div className="alert-title">Pedido #0142 pendiente de aprobación</div>
                  <div className="alert-sub">Cliente: Empresa XYZ · Valor: $3.200.000 COP</div>
                </div>
                <div className="alert-time">hace 25 min</div>
              </div>
              <div className="alert-item">
                <div className="alert-icon ai-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#6ab4ff" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <div className="alert-body">
                  <div className="alert-title">Nuevo mensaje de cliente</div>
                  <div className="alert-sub">Laura Peñaloza pregunta por el estado de su reparación.</div>
                </div>
                <div className="alert-time">hace 1 h</div>
              </div>
              <div className="alert-item">
                <div className="alert-icon ai-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3fcfa0" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="alert-body">
                  <div className="alert-title">Proyecto entregado — App móvil Distribuidora Guajira</div>
                  <div className="alert-sub">Cliente calificó el servicio con 5 estrellas.</div>
                </div>
                <div className="alert-time">hace 3 h</div>
              </div>
            </div>
          </div>

          {/* PEDIDOS + ACCIONES */}
          <div className="two-col">
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">Pedidos recientes</span>
                <span className="panel-action">Ver todos</span>
              </div>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Servicio / Producto</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="td-name">
                        {clients.find(c => c.id === order.client_id)?.name || 'Cliente desconocido'}
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{order.item_name}</td>
                      <td>
                        <span className={`badge b-${order.status === 'completed' ? 'green' : order.status === 'in_progress' ? 'amber' : order.status === 'cancelled' ? 'red' : 'blue'}`}>
                          {order.status === 'completed' ? 'Entregado' : order.status === 'in_progress' ? 'En proceso' : order.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text)', fontWeight: '600' }}>
                        ${order.total.toLocaleString('es-CO')}
                      </td>
                      <td>
                        <button className="act-btn">Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">Acciones rápidas</span>
              </div>
              <div className="qa-grid">
                <div className="qa-btn">
                  <div className="qa-icon" style={{ background: 'rgba(30,127,255,0.15)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#6ab4ff" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <div className="qa-label">Nuevo producto</div>
                    <div className="qa-sub">Agregar al catálogo</div>
                  </div>
                </div>
                <div className="qa-btn">
                  <div className="qa-icon" style={{ background: 'rgba(29,158,117,0.15)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3fcfa0" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <div className="qa-label">Nuevo servicio</div>
                    <div className="qa-sub">Crear orden de trabajo</div>
                  </div>
                </div>
                <div className="qa-btn">
                  <div className="qa-icon" style={{ background: 'rgba(186,117,23,0.15)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#e8a430" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                    </svg>
                  </div>
                  <div>
                    <div className="qa-label">Agregar cliente</div>
                    <div className="qa-sub">Registro nuevo</div>
                  </div>
                </div>
                <div className="qa-btn">
                  <div className="qa-icon" style={{ background: 'rgba(127,119,221,0.15)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#afa9ec" strokeWidth="2">
                      <line x1="12" y1="20" x2="12" y2="10" />
                      <line x1="18" y1="20" x2="18" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <div className="qa-label">Ver reporte</div>
                    <div className="qa-sub">Exportar a PDF</div>
                  </div>
                </div>
                <div className="qa-btn">
                  <div className="qa-icon" style={{ background: 'rgba(226,75,74,0.15)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#f07070" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div className="qa-label">Registrar pago</div>
                    <div className="qa-sub">Cobro manual</div>
                  </div>
                </div>
                <div className="qa-btn">
                  <div className="qa-icon" style={{ background: 'rgba(0,212,255,0.12)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M2 12h2M20 12h2" />
                    </svg>
                  </div>
                  <div>
                    <div className="qa-label">Configuración</div>
                    <div className="qa-sub">Ajustes del sitio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="full-panel">
            <div className="panel-head">
              <span className="panel-title">Gestión de productos</span>
              <button className="add-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="14" height="14">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar producto
              </button>
            </div>
            <div className="search-bar">
              <input type="text" placeholder="Buscar por nombre, categoría, SKU" />
              <button className="act-btn" style={{ padding: '7px 14px', fontSize: '12px' }}>Filtrar</button>
              <button className="act-btn" style={{ padding: '7px 14px', fontSize: '12px' }}>Exportar</button>
            </div>
            <table className="adm-table" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '36px' }}></th>
                  <th style={{ width: '28%' }}>Producto</th>
                  <th style={{ width: '14%' }}>Categoría</th>
                  <th style={{ width: '12%' }}>Precio</th>
                  <th style={{ width: '10%' }}>Stock</th>
                  <th style={{ width: '12%' }}>Estado</th>
                  <th style={{ width: '18%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="prod-thumb" style={{ background: 'rgba(30,127,255,0.12)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#6ab4ff" strokeWidth="2" width="16" height="16">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                        </svg>
                      </div>
                    </td>
                    <td className="td-name">{product.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{product.category}</td>
                    <td style={{ color: 'var(--cyan)', fontWeight: '600' }}>
                      ${product.price.toLocaleString('es-CO')}
                    </td>
                    <td style={{ color: 'var(--text)' }}>12</td>
                    <td>
                      <span className="badge b-green">Activo</span>
                    </td>
                    <td>
                      <div className="td-act">
                        <button className="act-btn">Editar</button>
                        <button className="act-btn danger">Quitar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SERVICIOS */}
          <div className="full-panel">
            <div className="panel-head">
              <span className="panel-title">Gestión de servicios</span>
              <button className="add-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="14" height="14">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nueva orden
              </button>
            </div>
            <table className="adm-table" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>Cliente</th>
                  <th style={{ width: '22%' }}>Servicio</th>
                  <th style={{ width: '14%' }}>Técnico</th>
                  <th style={{ width: '12%' }}>Fecha</th>
                  <th style={{ width: '12%' }}>Valor</th>
                  <th style={{ width: '12%' }}>Estado</th>
                  <th style={{ width: '10%' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => o.type === 'service').map((order) => (
                  <tr key={order.id}>
                    <td className="td-name">
                      {clients.find(c => c.id === order.client_id)?.name || 'Cliente desconocido'}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{order.item_name}</td>
                    <td style={{ color: 'var(--muted)' }}>{order.technician || 'Sin asignar'}</td>
                    <td style={{ color: 'var(--muted)' }}>
                      {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ color: 'var(--cyan)', fontWeight: '600' }}>
                      ${order.total.toLocaleString('es-CO')}
                    </td>
                    <td>
                      <span className={`badge b-${order.status === 'completed' ? 'green' : order.status === 'in_progress' ? 'amber' : order.status === 'cancelled' ? 'red' : 'blue'}`}>
                        {order.status === 'completed' ? 'Completado' : order.status === 'in_progress' ? 'En proceso' : order.status === 'cancelled' ? 'Cancelado' : 'Programado'}
                      </span>
                    </td>
                    <td>
                      <button className="act-btn">Gestionar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CLIENTES */}
          <div className="full-panel">
            <div className="panel-head">
              <span className="panel-title">Clientes registrados</span>
              <button className="add-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="14" height="14">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nuevo cliente
              </button>
            </div>
            <table className="adm-table" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '36px' }}></th>
                  <th style={{ width: '22%' }}>Nombre</th>
                  <th style={{ width: '22%' }}>Contacto</th>
                  <th style={{ width: '14%' }}>Ciudad</th>
                  <th style={{ width: '10%' }}>Pedidos</th>
                  <th style={{ width: '14%' }}>Total gastado</th>
                  <th style={{ width: '12%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(30,127,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#6ab4ff'
                      }}>
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    </td>
                    <td className="td-name">{client.name}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '11px' }}>{client.contact || 'Sin contacto'}</td>
                    <td style={{ color: 'var(--muted)' }}>{client.city || 'Sin ciudad'}</td>
                    <td style={{ color: 'var(--text)', fontWeight: '600' }}>{client.total_orders}</td>
                    <td style={{ color: 'var(--cyan)', fontWeight: '600' }}>
                      ${client.total_spent.toLocaleString('es-CO')}
                    </td>
                    <td>
                      <button className="act-btn">Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard