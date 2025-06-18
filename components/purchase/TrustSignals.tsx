'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Award, Star, Users, Clock } from 'lucide-react'
import Image from 'next/image'

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "CEO",
    company: "TechStart Inc.",
    content: "The Anthrasite report revealed issues we had no idea existed. We implemented their recommendations and saw a 40% increase in organic traffic within 3 months.",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "Marketing Director",
    company: "GrowthCo",
    content: "Worth every penny. The detailed analysis helped us prioritize our development roadmap and improve our conversion rate by 25%.",
    rating: 5,
  },
  {
    name: "Emily Thompson",
    role: "Founder",
    company: "Digital Solutions LLC",
    content: "The security vulnerabilities they found saved us from a potential disaster. Their report is incredibly thorough and actionable.",
    rating: 5,
  },
]

export function TrustSignals() {
  return (
    <section className="py-16 md:py-24">
      <div className="px-10 max-w-[1200px] mx-auto">
          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-16"
          >
            <h2 className="text-[40px] font-light mb-12">
              Trusted by Leading Businesses
            </h2>
            
            <div className="flex flex-wrap justify-center gap-12 md:gap-16">
              <div className="flex flex-col items-center">
                <Shield className="w-16 h-16 text-accent mb-4 opacity-80" />
                <p className="text-[17px]">Enterprise Grade</p>
                <p className="text-[15px] opacity-60">Security</p>
              </div>
              
              <div className="flex flex-col items-center">
                <Lock className="w-16 h-16 text-accent mb-4 opacity-80" />
                <p className="text-[17px]">SSL Encrypted</p>
                <p className="text-[15px] opacity-60">Payments</p>
              </div>
              
              <div className="flex flex-col items-center">
                <Award className="w-16 h-16 text-accent mb-4 opacity-80" />
                <p className="text-[17px]">100% Guarantee</p>
                <p className="text-[15px] opacity-60">Satisfaction</p>
              </div>
              
              <div className="flex flex-col items-center">
                <Clock className="w-16 h-16 text-accent mb-4 opacity-80" />
                <p className="text-[17px]">24 Hour</p>
                <p className="text-[15px] opacity-60">Delivery</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            <div className="text-center">
              <div className="text-[48px] font-light text-accent mb-2">
                10,000+
              </div>
              <p className="text-[17px] opacity-60">Audits Delivered</p>
            </div>
            
            <div className="text-center">
              <div className="text-[48px] font-light text-accent mb-2">
                98%
              </div>
              <p className="text-[17px] opacity-60">Satisfaction Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-[48px] font-light text-accent mb-2">
                4.9/5
              </div>
              <p className="text-[17px] opacity-60">Average Rating</p>
            </div>
            
            <div className="text-center">
              <div className="text-[48px] font-light text-accent mb-2">
                24hr
              </div>
              <p className="text-[17px] opacity-60">Report Delivery</p>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                className="carbon-container p-8"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-[17px] mb-6 opacity-80 italic">
                  "{testimonial.content}"
                </p>
                
                {/* Author */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[17px]">{testimonial.name}</p>
                  <p className="text-[15px] opacity-60">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Security Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
            className="mt-16 pt-16 border-t border-white/10"
          >
            <p className="text-center text-[17px] opacity-60 mb-8">
              Your payment is secure and protected
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-12">
              {/* Stripe Badge */}
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-white/40" />
                <span className="text-[17px] opacity-60">Powered by Stripe</span>
              </div>
              
              {/* SSL Badge */}
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-white/40" />
                <span className="text-[17px] opacity-60">256-bit SSL Encryption</span>
              </div>
              
              {/* Money Back */}
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-white/40" />
                <span className="text-[17px] opacity-60">30-Day Money Back Guarantee</span>
              </div>
            </div>
          </motion.div>
      </div>
    </section>
  )
}