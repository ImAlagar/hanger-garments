import React from 'react'

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold font-bai-jamjuree text-gray-900 mb-6">Shipping Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">1. Shipping Areas</h2>
              <p>Hanger Garments currently ships to all major cities and towns across India. We are working to expand our shipping network to more locations.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">2. Processing Time</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Orders are processed within 1-2 business days</li>
                <li>Orders placed on weekends or holidays will be processed the next business day</li>
                <li>During sale periods, processing may take 2-3 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">3. Shipping Time & Costs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 border-b text-left">Service</th>
                      <th className="py-2 px-4 border-b text-left">Delivery Time</th>
                      <th className="py-2 px-4 border-b text-left">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b">Standard Shipping</td>
                      <td className="py-2 px-4 border-b">5-7 business days</td>
                      <td className="py-2 px-4 border-b">₹49</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b">Express Shipping</td>
                      <td className="py-2 px-4 border-b">2-3 business days</td>
                      <td className="py-2 px-4 border-b">₹99</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b">Free Shipping</td>
                      <td className="py-2 px-4 border-b">5-7 business days</td>
                      <td className="py-2 px-4 border-b">Free on orders above ₹999</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">4. Order Tracking</h2>
              <p>Once your order is shipped, you will receive a confirmation email with tracking information. You can track your order using the provided tracking number on our website or the courier partner's website.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">5. Shipping Restrictions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not ship to PO boxes</li>
                <li>Some remote locations may have extended delivery times</li>
                <li>Delivery delays may occur during festivals or adverse weather conditions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">6. International Shipping</h2>
              <p>Currently, we only ship within India. We are working on expanding our services internationally.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">7. Contact Us</h2>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p>For any shipping-related queries, please contact our customer support:</p>
                <p><strong>Email:</strong> info@hangergarments.com</p>
                <p><strong>Phone:</strong> +91 81227 47148</p>
                <p><strong>Business Hours:</strong> Mon–Sun: 9AM – 9PM</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingPolicy