import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Admin from './Admin'

function App() {
  const [desserts, setDesserts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDessert, setSelectedDessert] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  
  const [reservation, setReservation] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_date: '',
    pickup_time: '',
    quantity: 1,
    notes: ''
  })

  useEffect(() => {
    fetchDesserts()
  }, [])

  async function fetchDesserts() {
    const { data, error } = await supabase
      .from('desserts')
      .select('*')
      .gt('stock_quantity', 0)
    
    if (error) console.error('Error:', error)
    else setDesserts(data)
    setLoading(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    
    if (loginData.email === 'admin' && loginData.password === 'postres123') {
      setIsAdmin(true)
      setShowLogin(false)
    } else {
      setLoginError('Credenciales incorrectas')
    }
  }

  function handleLogout() {
    setIsAdmin(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    const { error } = await supabase
      .from('reservations')
      .insert({
        dessert_id: selectedDessert.id,
        quantity: reservation.quantity,
        pickup_date: reservation.pickup_date,
        pickup_time: reservation.pickup_time,
        customer_name: reservation.customer_name,
        customer_email: reservation.customer_email,
        customer_phone: reservation.customer_phone,
        notes: reservation.notes,
        status: 'pending',
        user_id: null
      })

    if (error) {
      alert('Error al crear reserva: ' + error.message)
      console.error(error)
    } else {
      alert('¡Reserva creada exitosamente! Te esperamos el ' + reservation.pickup_date)
      setSelectedDessert(null)
      setReservation({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        pickup_date: '',
        pickup_time: '',
        quantity: 1,
        notes: ''
      })
    }
  }

  if (isAdmin) {
    return (
      <div>
        <button 
          onClick={handleLogout}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'white',
            color: '#e3a4b8',
            border: '1.5px solid #f0c9d4',
            padding: '10px 22px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '600',
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.85rem',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 14px rgba(74, 57, 66, 0.1)'
          }}
        >
          ← Volver a la Tienda
        </button>
        <div style={{paddingTop: '80px'}}>
          <Admin />
        </div>
      </div>
    )
  }

  if (showLogin) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div style={{fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#c9a45f', marginBottom: '14px', marginTop: '10px'}}>✦</div>
          <h2>Panel Administrativo</h2>
          <p className="subtitle">Acceso exclusivo para personal autorizado</p>
          
          {loginError && <div className="login-error">{loginError}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{textAlign: 'left'}}>
              <label>Usuario</label>
              <input 
                type="text"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                placeholder="admin"
                required
              />
            </div>

            <div className="form-group" style={{textAlign: 'left'}}>
              <label>Contraseña</label>
              <input 
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>

            <div style={{display: 'flex', gap: '15px', marginTop: '30px'}}>
              <button 
                type="button"
                onClick={() => setShowLogin(false)}
                className="btn-secondary"
                style={{flex: 1}}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="btn-primary"
                style={{flex: 1}}
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading">Cargando postres...</div>

  return (
    <div>
      {/* Botón secreto admin */}
      <button 
        className="admin-secret-btn"
        onClick={() => setShowLogin(true)}
        title="Área administrativa"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <a href="#" className="logo">Dulce Capricho</a>
          <ul className="nav-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#postres">Nuestros Postres</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
          <a href="#" style={{display: 'flex', alignItems: 'center'}}>
            <img 
              src="/logo.png" 
              alt="Dulce Capricho" 
              style={{height: '50px', width: 'auto'}}
            />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="inicio">
        <div className="hero-content">
          <h1>Pequeños <span>lujos</span> dulces, hechos a mano</h1>
          <p>Postres artesanales elaborados en lotes pequeños, con cuidado. Reserva el tuyo y disfrútalo fresco.</p>
          <button 
            className="btn-primary"
            onClick={() => document.getElementById('postres').scrollIntoView({behavior: 'smooth'})}
          >
            Ver Postres
          </button>
        </div>
      </section>

      {/* Productos */}
      <section className="section" id="postres">
        <div className="section-title">
          <h2>Nuestras Especialidades</h2>
          <p>Elige entre nuestra selección de postres artesanales</p>
        </div>
        
        {!selectedDessert ? (
          <div className="desserts-grid">
            {desserts.map(dessert => (
              <div key={dessert.id} className="dessert-card">
                <div className="dessert-image">
                  {dessert.name === 'Cupcakes rellenos' && (
                    <img src="/img/cupcakes.jpg" alt={dessert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {dessert.name === 'Roles de Canela' && (
                    <img src="/img/roless.jpg" alt={dessert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {dessert.name === 'Café granizado' && (
                    <img src="/img/cafe.jpg" alt={dessert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  
                  {!['Cupcakes rellenos', 'Roles de Canela', 'Café granizado'].includes(dessert.name) && (
                    <img src="/img/defecto.jpg" alt={dessert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div className="dessert-content">
                  <h3 className="dessert-title">{dessert.name}</h3>
                  <p className="dessert-description">{dessert.description}</p>
                  <div className="dessert-footer">
                    <span className="price">${dessert.price}</span>
                    <button 
                      onClick={() => setSelectedDessert(dessert)}
                      className="btn-primary"
                      style={{padding: '10px 25px', fontSize: '0.8rem'}}
                    >
                      Reservar
                    </button>
                  </div>
                  <span className="stock">Disponibles: {dessert.stock_quantity}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="reservation-container">
            <button 
              onClick={() => setSelectedDessert(null)}
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                background: 'none',
                border: 'none',
                color: '#a4898f',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: "'Montserrat', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              ← Volver
            </button>
            
            <h2>Reservar: {selectedDessert.name}</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label>Cantidad</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedDessert.stock_quantity}
                    value={reservation.quantity}
                    onChange={(e) => setReservation({...reservation, quantity: parseInt(e.target.value)})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de retiro</label>
                  <input 
                    type="date"
                    value={reservation.pickup_date}
                    onChange={(e) => setReservation({...reservation, pickup_date: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hora de retiro</label>
                <input 
                  type="time"
                  value={reservation.pickup_time}
                  onChange={(e) => setReservation({...reservation, pickup_time: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre completo</label>
                <input 
                  type="text"
                  value={reservation.customer_name}
                  onChange={(e) => setReservation({...reservation, customer_name: e.target.value})}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email"
                    value={reservation.customer_email}
                    onChange={(e) => setReservation({...reservation, customer_email: e.target.value})}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input 
                    type="tel"
                    value={reservation.customer_phone}
                    onChange={(e) => setReservation({...reservation, customer_phone: e.target.value})}
                    placeholder="555-1234"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notas especiales</label>
                <textarea 
                  value={reservation.notes}
                  onChange={(e) => setReservation({...reservation, notes: e.target.value})}
                  rows="3"
                  placeholder="Alergias, dedicatorias..."
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  onClick={() => setSelectedDessert(null)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      <footer style={{
        background: 'linear-gradient(135deg, #f8e1e7, #f0c9d4)',
        padding: '50px 20px',
        textAlign: 'center',
        marginTop: '80px'
      }}>
        <div style={{fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 600, color: '#4a3942', marginBottom: '8px'}}>
          Dulce Capricho
        </div>
        <p style={{color: '#8a6470', fontSize: '0.85rem', letterSpacing: '0.3px'}}>
          © 2026 Dulce Capricho. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}

export default App