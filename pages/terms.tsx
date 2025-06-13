export default function Terms () {
  return (
   
      <div dangerouslySetInnerHTML={{ __html: `<!-- Navigation -->
   <nav>
        <div class="nav-container">
            <div class="logo"><a href="/" class="logo">ANTHRASITE</a></div>
            <ul class="nav-links">
                <li><a href="/#assessment">Assessment</a></li>
                <li><a href="/#faq">FAQ</a></li>
            </ul>
        </div>
    </nav>
    
<p style="padding-top: 2em"></p>
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-text">
            <h1>Terms of Service</h1>
            <p>Effective Date: [Insert Effective Date Here]</p>
        </div>
    </section>


</p>

        <!-- Footer -->
    <footer>
        <div class="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact</a>
        </div>
        <p class="footer-copy">
            © 2024 Anthrasite. All rights reserved.
        </p>
    </footer>
      
    `}} />   

  );
}