export default function Contact () {
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
    

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-text">
            <h1>Contact</h1>
            <p>contact content.</p>
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