export default function CSSTestPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: 'red', fontSize: '3rem' }}>Red Heading - CSS Test</h1>
      <p style={{ color: 'blue', fontSize: '1.5rem' }}>Blue paragraph text</p>
      <div
        style={{
          backgroundColor: 'yellow',
          padding: '1rem',
          marginTop: '1rem',
        }}
      >
        Yellow background box
      </div>
      <h2 className="text-4xl text-anthracite-black">
        Tailwind Test - Should be large and black
      </h2>
      <p className="text-anthracite-blue">Tailwind blue text</p>
    </div>
  )
}
