import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold font-bai-jamjuree text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="mb-4">At Tiruppur Garments, we collect information to provide better services to our customers. We collect information in the following ways:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Information you give us (name, email, shipping address, etc.)</li>
                <li>Information we get from your use of our services</li>
                <li>Information from cookies and similar technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">2. How We Use Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Process your orders and deliver products</li>
                <li>Provide customer support</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Ensure the security of our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">3. Information Sharing</h2>
              <p>We do not share your personal information with companies, organizations, or individuals outside of Tiruppur Garments except in the following cases:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>With your consent</li>
                <li>For external processing with trusted partners</li>
                <li>For legal reasons</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">4. Data Security</h2>
              <p>We work hard to protect Tiruppur Garments and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> contact@Tiruppurgarments.com</p>
                <p><strong>Phone:</strong> +91 88833 85888</p>
                <p><strong>Address:</strong> 8/2514 . Thiyagi Kumaran St, Pandian Nagar , Tiruppur , Tamilnadu - 641602</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy