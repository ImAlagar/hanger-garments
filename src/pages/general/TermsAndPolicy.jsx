import React from 'react'

const TermsAndPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold font-bai-jamjuree text-gray-900 mb-6">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p>By accessing and using Hanger Garments' website and services, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">2. Products and Pricing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All products are subject to availability</li>
                <li>We reserve the right to discontinue any product at any time</li>
                <li>Prices are subject to change without notice</li>
                <li>We are not responsible for typographical errors regarding price or product information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">3. Orders and Payment</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All orders are subject to acceptance and availability</li>
                <li>We accept various payment methods including credit/debit cards and digital wallets</li>
                <li>Your order will be processed only after payment authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">4. Intellectual Property</h2>
              <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of Hanger Garments and protected by copyright laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">5. Limitation of Liability</h2>
              <p>Hanger Garments shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">6. Governing Law</h2>
              <p>These terms shall be governed by and construed in accordance with the laws of India.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">7. Contact Information</h2>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> contact@hangergarments.com</p>
                <p><strong>Phone:</strong> +91 81227 47148</p>
                <p><strong>Address:</strong> No.12, ABC Street, Tiruppur, Tamil Nadu, India</p>
                <p><strong>Business Hours:</strong> Mon–Sun: 9AM – 9PM</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsAndPolicy