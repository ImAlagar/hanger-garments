import React from 'react'

const ReturnsAndRefunds = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold font-bai-jamjuree text-gray-900 mb-6">Returns & Refunds Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">1. Return Policy</h2>
              <p>We want you to be completely satisfied with your purchase from Tiruppur Garments. If you're not happy with your order, we accept returns within 30 days of delivery.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">2. Eligibility for Returns</h2>
              <p>To be eligible for a return, your item must be:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>In the original condition</li>
                <li>Unwashed and unworn</li>
                <li>With original tags attached</li>
                <li>In the original packaging</li>
              </ul>
              <p className="mt-4 text-amber-600 font-medium">Note: We do not accept returns for innerwear, socks, or customized items for hygiene reasons.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">3. Return Process</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our customer service within 30 days of delivery</li>
                <li>Provide your order number and reason for return</li>
                <li>We will provide you with a return authorization and shipping label</li>
                <li>Pack the item securely and ship it back to us</li>
                <li>Once received and inspected, we will process your refund or exchange</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">4. Refund Policy</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Refunds will be processed to the original payment method</li>
                <li>Processing time: 5-7 business days after we receive the returned item</li>
                <li>Shipping charges are non-refundable</li>
                <li>Return shipping costs are the responsibility of the customer, unless the return is due to our error</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">5. Exchanges</h2>
              <p>We are happy to exchange items for a different size or color, subject to availability. If the requested item is not available, we will issue a refund.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">6. Damaged or Defective Items</h2>
              <p>If you receive a damaged or defective item, please contact us within 48 hours of delivery. We will arrange for a free return and send a replacement at no additional cost.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-bai-jamjuree text-gray-900 mb-4">7. Contact Us</h2>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p>For return requests or any questions about our returns policy:</p>
                <p><strong>Email:</strong> contact@Tiruppurgarments.com</p>
                <p><strong>Phone:</strong> +91 88833 85888</p>
                <p><strong>Address:</strong> 8/2514 . Thiyagi Kumaran St, Pandian Nagar , Tiruppur , Tamilnadu - 641602</p>
                <p><strong>Business Hours:</strong> Mon–Sun: 9AM – 8PM</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReturnsAndRefunds