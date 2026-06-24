import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Admin() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReservations()
    
    // Suscripción en tiempo real
    const subscription = supabase
      .channel('reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchReservations()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        desserts (name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error:', error)
    } else {
      setReservations(data || [])
    }
    setLoading(false)
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (!error) {
      setReservations(reservations.map(r => 
        r.id === id ? { ...r, status: newStatus } : r
      ))
    }
  }

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    }
    return classes[status] || 'status-pending'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      completed: 'Completado',
      cancelled: 'Cancelado'
    }
    return texts[status] || status
  }

  if (loading) return <div className="loading">Cargando reservas...</div>

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Panel de Administración</h1>
          <p style={{color: '#666', marginTop: '5px'}}>
            {reservations.length} reservas totales
          </p>
        </div>
      </div>
      
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Fecha/Hora Retiro</th>
              <th>Cant.</th>
              <th>Estado</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <tr key={res.id}>
                <td><strong>{res.desserts?.name}</strong></td>
                <td>{res.customer_name}</td>
                <td>
                  <div>{res.customer_email}</div>
                  <small style={{color: '#666'}}>{res.customer_phone || 'Sin teléfono'}</small>
                </td>
                <td>
                  <div>{res.pickup_date}</div>
                  <small style={{color: '#666'}}>{res.pickup_time}</small>
                </td>
                <td style={{textAlign: 'center'}}>{res.quantity}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(res.status)}`}>
                    {getStatusText(res.status)}
                  </span>
                </td>
                <td style={{maxWidth: '150px', fontSize: '0.9rem', color: '#666'}}>
                  {res.notes || '-'}
                </td>
                <td>
                  <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                    {res.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(res.id, 'confirmed')}
                        className="btn btn-primary"
                        style={{padding: '5px 10px', fontSize: '0.8rem'}}
                      >
                        Confirmar
                      </button>
                    )}
                    {res.status === 'confirmed' && (
                      <button 
                        onClick={() => updateStatus(res.id, 'completed')}
                        className="btn btn-primary"
                        style={{padding: '5px 10px', fontSize: '0.8rem'}}
                      >
                        Completar
                      </button>
                    )}
                    {(res.status === 'pending' || res.status === 'confirmed') && (
                      <button 
                        onClick={() => updateStatus(res.id, 'cancelled')}
                        className="btn btn-secondary"
                        style={{padding: '5px 10px', fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b'}}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reservations.length === 0 && (
        <div style={{textAlign: 'center', padding: '60px', color: '#999'}}>
          <div style={{fontSize: '3rem', marginBottom: '20px'}}>📋</div>
          <h3>No hay reservas aún</h3>
          <p>Las reservas aparecerán aquí cuando los clientes hagan pedidos</p>
        </div>
      )}
    </div>
  )
}