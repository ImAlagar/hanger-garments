// utils/razorpayService.js
class RazorpayService {
  constructor() {
    this.razorpayKey = import.meta.env.VITE_APP_RAZORPAY_KEY_ID;
    this.loadRazorpay();
  }

  loadRazorpay() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay SDK loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        reject(new Error('Failed to load Razorpay SDK'));
      };
      document.body.appendChild(script);
    });
  }

  async openRazorpayCheckout(options) {
    try {
      await this.loadRazorpay();
      
      return new Promise((resolve, reject) => {
        const rzpOptions = {
          key: this.razorpayKey,
          amount: options.amount,
          currency: options.currency || 'INR',
          name: options.name || 'Hanger Garments',
          description: options.description || 'Order Payment',
          order_id: options.razorpayOrderId,
          handler: function (response) {
            resolve(response);
          },
          prefill: {
            name: options.prefill?.name || '',
            email: options.prefill?.email || '',
            contact: options.prefill?.contact || '',
          },
          notes: options.notes || {},
          theme: {
            color: options.theme?.color || '#3399cc'
          },
          modal: {
            ondismiss: function() {
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
      });
    } catch (error) {
      console.error('Razorpay checkout error:', error);
      throw error;
    }
  }
}

export default new RazorpayService();