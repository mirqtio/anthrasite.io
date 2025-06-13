export default function Home() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `<!-- Navigation -->
    <nav>
        <div class="nav-container">
            <div class="logo"><a href="/" class="logo"><img src="/logo.png" alt="Anthrasite Logo" width="27" style="padding-right: 5px; margin-top:0px"/>ANTHRASITE</a></div>
            <ul class="nav-links">
                <li><a href="#assessment">Assessment</a></li>
                <li><a href="#faq">FAQ</a></li>
            </ul>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
         <img src="logo.png"/>
            <h1>Your website analyzed.<br>Crystallized.</h1>
            <p class="hero-subtitle">
                We compress thousands of data points into the 2-3 insights 
                that actually matter for your business.
            </p>
            
            <!-- The One Effect -->
            <div class="pressure-visual">
                <div class="pressure-ring" style="--scale: 1"></div>
                <div class="pressure-ring" style="--scale: 0.8"></div>
                <div class="pressure-ring" style="--scale: 0.6"></div>
                <div class="pressure-center">
                    <div class="pressure-text">?</div>
                    <div class="pressure-label">Your Score</div>
                </div>
            </div>
            
            <a href="#" class="cta-primary" onclick="openPurchase(); return false;">
                Get Your Audit Report
            </a>
        </div>
    </section>
    
    <!-- Assessment Section -->
    <section id="assessment" class="section">
        <div class="section-container">
            <h2>What We Analyze</h2>
            
            <div class="assessment-grid">
                <div class="assessment-item">
                    <div class="assessment-number">2.7s</div>
                    <h3 class="assessment-title">Load Performance</h3>
                    <p class="assessment-detail">
                        How fast your site loads on real devices, 
                        and what it's costing you in lost customers.
                    </p>
                </div>
                
                <div class="assessment-item">
                    <div class="assessment-number">47%</div>
                    <h3 class="assessment-title">Mobile Experience</h3>
                    <p class="assessment-detail">
                        Where mobile visitors fail to convert,
                        with specific breakpoints identified.
                    </p>
                </div>
                
                <div class="assessment-item">
                    <div class="assessment-number">$$$</div>
                    <h3 class="assessment-title">Revenue Impact</h3>
                    <p class="assessment-detail">
                        Exact monthly revenue loss from technical issues,
                        calculated for your specific market.
                    </p>
                </div>
            </div>
            
            <p style="text-align: center; opacity: 0.6; font-size: 18px;">
                No fluff. No 50-page reports. Just what's broken and what it's worth to fix it.
            </p>
        </div>
    </section>
    
    <!-- FAQ Section -->
    <section id="faq" class="section">
        <div class="section-container" style="max-width: 800px;">
            <h2>Questions</h2>
            
            <div class="faq-item">
                <div class="faq-question">
                    What exactly do I get?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    [A focused report of all of your website problems, including their estimated impact  on your revenue. You'll also receive customlized recommendations for how to fix each problem. <!-- with options to engage digital agencies and other Anthrasite service partners. --> Bottom line: You'll receieve timely and critical insights, ready for you to action to protect and grow your business.]
                </div>
            </div>
       
            <div class="faq-item">
                <div class="faq-question">
                    How do we put a dollar figure on your score?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    We start with publicly‑available business‑pattern data from the <i>U.S. Census ZIP Business Patterns (2022) and BLS QCEW Employment & Wages (2024 Q3)</i>. Payroll is converted to revenue using ratios published in the <i>BEA Bridging Tables, 2023</i> — typically <b>2.2</b>× for small businesses. We then apply an evidence‑based digital‑conversion uplift (Google Chrome UX Report, 2023) showing that <b>a 10‑point performance gain lifts online conversions by 9 %</b>. Finally, we adjust for your industry’s average online‑revenue share (Adobe Digital Economy Index, 2024). The result is an annual revenue‑per‑point estimate unique to your ZIP and vertical.

                </div>
            </div>

             <div class="faq-item">
                <div class="faq-question">
                    How accurate are these dollar numbers?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    <i>They’re conservative first‑pass estimates based on federal payroll data and peer benchmarks. As soon as you authorise Google Business Profile or Stripe insights we replace estimates with your real numbers.</i>

                </div>
            </div>

            <div class="faq-item">
                <div class="faq-question">
                    Do you sell or share my data?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    <i>Never. We only collect publicly‑available signals plus the information you choose to share.</i>

                </div>
            </div>


            <div class="faq-item">
                <div class="faq-question">
                    How is this different from free tools?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    Free tools show you hundreds of issues without context. 
                    We analyze your specific business, calculate actual revenue impact, 
                    and show only what matters. It's the difference between 
                    a medical encyclopedia and a doctor's diagnosis.
                </div>
            </div>
            
            <div class="faq-item">
                <div class="faq-question">
                    How long does it take?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    Your report is delivered instantly after purchase. 
                    Our AI has already analyzed your site - we're just 
                    waiting for you to claim the insights.
                </div>
            </div>
            <!--- removed for now
            <div class="faq-item">
                <div class="faq-question">
                    What if I need help implementing fixes?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    Your report includes clear next steps. If you need 
                    professional help, we can connect you with vetted 
                    agencies who specialize in your specific issues.
                </div>
            </div>
            -->

        </div>
    </section>
    
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
    
    <!-- Purchase Flow Modal -->
    <div class="purchase-modal" id="purchaseModal">
        <div class="purchase-container">
            <button class="purchase-close" onclick="closePurchase()">&times;</button>
            
            <!-- Step 1: Enter Website -->
            <div class="purchase-step active" id="step1">
                <h2 class="purchase-title">Let's analyze your website</h2>
                
                <div class="form-group">
                    <label class="form-label">Your Website URL</label>
                    <input type="url" class="form-input" id="websiteUrl" 
                           placeholder="https://example.com" 
                           value="">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Your Email</label>
                    <input type="email" class="form-input" id="email" 
                           placeholder="you@example.com">
                </div>
                
                <button class="purchase-button" onclick="goToStep2()">
                    Continue to Payment
                </button>
            </div>
            
            <!-- Step 2: Payment -->
            <div class="purchase-step" id="step2">
                <h2 class="purchase-title">Complete your purchase</h2>
                
                <div class="price-display">
                    <div class="price-amount">$99</div>
                    <div class="price-label">ONE-TIME PAYMENT</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Card Number</label>
                    <input type="text" class="form-input" placeholder="4242 4242 4242 4242">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label class="form-label">Expiry</label>
                        <input type="text" class="form-input" placeholder="MM/YY">
                    </div>
                    <div class="form-group">
                        <label class="form-label">CVC</label>
                        <input type="text" class="form-input" placeholder="123">
                    </div>
                </div>
                
                <button class="purchase-button" onclick="completePurchase()">
                    Get My Report Now
                </button>
                
                <p style="text-align: center; margin-top: 20px; opacity: 0.5; font-size: 14px;">
                    Secure payment via Stripe. Report delivered instantly.
                </p>
            </div>
        </div>
    </div>
    
    <script>
        // FAQ Toggle
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
        
        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Purchase Flow
        function openPurchase() {
            document.getElementById('purchaseModal').classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Pre-fill if we came from an email
            const urlParams = new URLSearchParams(window.location.search);
            const website = urlParams.get('site');
            if (website) {
                document.getElementById('websiteUrl').value = website;
            }
        }
        
        function closePurchase() {
            document.getElementById('purchaseModal').classList.remove('active');
            document.body.style.overflow = '';
        }
        
        function goToStep2() {
            const url = document.getElementById('websiteUrl').value;
            const email = document.getElementById('email').value;
            
            if (!url || !email) {
                alert('Please fill in all fields');
                return;
            }
            
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        }
        
        function completePurchase() {
            // In production, this would process payment via Stripe
            alert('Purchase complete! Check your email for your report.');
            closePurchase();
        }
        
        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closePurchase();
            }
        });
        
        // Close modal on background click
        document.getElementById('purchaseModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closePurchase();
            }
        });
    </script>` }} />
  );
}