export default function Terms () {
  return (
    <main style={{ backgroundColor: '#0A0A0A', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      {/* Add the div with dangerouslySetInnerHTML here */}
      <div dangerouslySetInnerHTML={{ __html: `<!-- Navigation -->
     <nav>
        <div class="nav-container">
            <div class="logo"><a href="/" class="logo">ANTHRASITE</a></div>
            <ul class="nav-links">
                <li><a href="#assessment">Assessment</a></li>
                <li><a href="#faq">FAQ</a></li>
            </ul>
        </div>
    </nav>`
    }} />

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Our Terms of Service</h1>
      <p>
Coming soon...


<a href="your-link-url" style={{ textDecoration:'none', color: 'white'  }}>
  Your linked text here
</a>



</p>
    </main>
  );
}