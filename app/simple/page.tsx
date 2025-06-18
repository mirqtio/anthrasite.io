export default function SimplePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      backgroundColor: '#f0f0f0'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        fontWeight: 'bold',
        color: '#000'
      }}>
        Simple Page Works!
      </h1>
      <p style={{ fontSize: '1.5rem', color: '#333' }}>
        If you can see this text with a gray background, the issue is with the CSS or context providers.
      </p>
    </div>
  )
}