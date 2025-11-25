import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/general/Home";
import Shop from "../pages/general/Shop";
import Contact from "../pages/general/Contact";
import Checkout from "../pages/general/Checkout";
import OrderSuccess from "../pages/general/OrderSuccess";

// Authentication Pages
import UserLogin from "../pages/Auth/UserLogin";
import UserRegister from "../pages/Auth/UserRegister";
import WholesalerLogin from "../pages/Auth/WholesalerLogin";
import WholesalerRegister from "../pages/Auth/WholesalerRegister";
import AdminLogin from "../pages/Auth/AdminLogin";
import OTPVerification from "../pages/Auth/OTPVerification";

// Dashboard Pages
import Dashboard from "../pages/Dashboard/Admin/Dashboard";
import AdminProducts from "../pages/Dashboard/Admin/products/AdminProducts";
import AddProduct from "../pages/Dashboard/Admin/products/AddProduct";
import EditProduct from "../pages/Dashboard/Admin/products/EditProduct";
import WholesalerApplications from "../pages/Dashboard/Admin/WholesalerApplications";

// Wholesaler Dashboard Pages
import WholesalerDashboard from "../pages/Dashboard/Wholesaler/WholesalerDashboard";
import WholesalerProducts from "../pages/Dashboard/Wholesaler/WholesalerProducts";
import WholesalerOrders from "../pages/Dashboard/Wholesaler/WholesalerOrders";

// User Dashboard Pages
import UserDashboard from "../pages/Dashboard/User/UserDashboard";
import UserOrders from "../pages/Dashboard/User/UserOrders";
import UserProfile from "../pages/Dashboard/User/UserProfile";
import UserWishlist from "../pages/Dashboard/User/UserWishlist";

// Protected Route Component
import ErrorPage from "../pages/general/ErrorPage";
import ProtectedRoute from "../components/admin/auth/ProductedRoute";
import MainLayout from "../layouts/MainLayout";
import AdminContacts from "../pages/Dashboard/Admin/contacts/AdminContacts";
import AdminCoupons from "../pages/Dashboard/Admin/coupons/AdminCoupons";
import AdminUsers from "../pages/Dashboard/Admin/users/AdminUsers";
import AdminOrders from "../pages/Dashboard/Admin/orders/AdminOrders";
import AdminCategories from "../pages/Dashboard/Admin/categories/AdminCategories";
import About from "../pages/general/About";
import AdminWholesalers from "../pages/Dashboard/Admin/wholesalers/AdminWholesalers";
import ViewProduct from "../pages/Dashboard/Admin/products/ViewProduct";
import AddCategory from "../pages/Dashboard/Admin/categories/AddCategory";
import EditCategory from "../pages/Dashboard/Admin/categories/EditCategory";
import ViewCategory from "../pages/Dashboard/Admin/categories/ViewCategory";
import AdminSubCategories from "../pages/Dashboard/Admin/subCategories/AdminSubCategories";
import AddSubCategory from "../pages/Dashboard/Admin/subCategories/AddSubCategory";
import EditSubCategory from "../pages/Dashboard/Admin/subCategories/EditSubCategory";
import ViewSubCategory from "../pages/Dashboard/Admin/subCategories/ViewSubCategory";
import AddUser from "../pages/Dashboard/Admin/users/AddUser";
import EditUser from "../pages/Dashboard/Admin/users/EditUser";
import ViewUser from "../pages/Dashboard/Admin/users/ViewUser";
import AddCustomer from "../pages/Dashboard/Admin/users/AddCustomer";
import AddAdmin from "../pages/Dashboard/Admin/users/AddAdmin";
import AddWholesaler from "../pages/Dashboard/Admin/users/AddWholesaler";
import ViewContact from "../pages/Dashboard/Admin/contacts/ViewContact";
import AdminRatings from "../pages/Dashboard/Admin/ratings/AdminRatings";
import ViewRating from "../pages/Dashboard/Admin/ratings/ViewRating";
import AddCoupon from "../pages/Dashboard/Admin/coupons/AddCoupon";
import EditCoupon from "../pages/Dashboard/Admin/coupons/EditCoupon";
import ViewCoupon from "../pages/Dashboard/Admin/coupons/ViewCoupon";
import EditSlider from "../pages/Dashboard/Admin/sliders/EditSlider";
import AdminSliders from "../pages/Dashboard/Admin/sliders/AdminSliders";
import AddSlider from "../pages/Dashboard/Admin/sliders/AddSlider";
import ViewSlider from "../pages/Dashboard/Admin/sliders/ViewSlider";
import Analytics from "../pages/Dashboard/Admin/Analytics";
import ViewOrder from "../pages/Dashboard/Admin/orders/ViewOrder";
import ProductDetailsPage from "../pages/general/ProductDetailsPage";
import PrivacyPolicy from "../pages/general/PrivacyPolicy";
import TermsAndPolicy from "../pages/general/TermsAndPolicy";
import ShippingPolicy from "../pages/general/ShippingPolicy";
import ReturnsAndRefunds from "../pages/general/ReturnsAndRefunds";
import Cart from "../pages/general/Cart";
import AdminCustomization from "../pages/Dashboard/Admin/customization/AdminCustomization";
import CustomizationForm from "../pages/Dashboard/Admin/customization/CustomizationForm";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import WholesalerForgotPassword from "../pages/Auth/WholesalerForgotPassword";
import AdminForgotPassword from "../pages/Auth/AdminForgotPassword";
import AdminResetPassword from "../pages/Auth/AdminResetPassword";
import SubcategoryQuantityPricing from "../pages/Dashboard/Admin/quantity-pricing/SubcategoryQuantityPricing";
import AdminQuantityPricing from "../pages/Dashboard/Admin/quantity-pricing/AdminQuantityPricing";
import AddQuantityPrice from "../pages/Dashboard/Admin/quantity-pricing/AddQuantityPrice";
import EditQuantityPrice from "../pages/Dashboard/Admin/quantity-pricing/EditQuantityPrice";
import ViewQuantityPrice from "../pages/Dashboard/Admin/quantity-pricing/ViewQuantityPrice";



export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Public Routes
      {
        index: true,
        element: <Home />
      },
      {
        path: "/about-us",
        element: <About />
      },
      {
        path: "/shop",
        element: <Shop />
      },
      {
      path: "/shop/:category",
      element: <Shop />
    },
      {
        path: "/contact",
        element: <Contact />
      },

      {
        path: "/wishlist",
        element: <UserWishlist />
      },
      {
        path: "/cart",
        element: <Cart />
      },
      {
        path: "/collections/:productSlug",
        element: <ProductDetailsPage />
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />
      },
      {
        path: "/terms",
        element: <TermsAndPolicy />
      },
      {
        path: "/shipping",
        element: <ShippingPolicy />
      },
      {
        path: "/cancellation",
        element: <ReturnsAndRefunds />
      },
        {
      path: "/checkout",
      element: (
        <ProtectedRoute allowedRoles={['CUSTOMER', 'WHOLESALER']}>
          <Checkout />
        </ProtectedRoute>
      )
    },
      // Authentication Routes
      {
        path: "/login",
        element: <UserLogin />
      },
      {
        path: "/register",
        element: <UserRegister />
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "/wholesaler/forgot-password",
        element: <WholesalerForgotPassword />
      },
      {
        path: "/reset-password",
        element: <ResetPassword />
      },

      {
        path: "/wholesaler/forgot-password",
        element: <WholesalerForgotPassword />
      },
      {
        path: "/reset-password",
        element: <ResetPassword />
      },

            {
        path: "/admin/forgot-password",
        element: <AdminForgotPassword />
      },
      {
        path: "/admin/reset-password",
        element: <AdminResetPassword />
      },
      {
        path: "/wholesaler/login",
        element: <WholesalerLogin />
      },
      {
        path: "/wholesaler/register",
        element: <WholesalerRegister />
      },
      {
        path: "/admin/login",
        element: <AdminLogin />
      },
      {
        path: "/verify-otp",
        element: <OTPVerification />
      },

        {
        path: "user/orders",
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <UserOrders />
          </ProtectedRoute>
        )
      },
    ]
  },
  {
        path: "wholesaler/dashboard",
        element: (
          <ProtectedRoute allowedRoles={['WHOLESALER']}>
            <WholesalerDashboard />
          </ProtectedRoute>
        )
    },
  {
    path: "/dashboard",
    element: <DashboardLayout />, // Remove ProtectedRoute wrapper
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "analytics",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Analytics />
          </ProtectedRoute>
        )
      },
      {
        path: "quantity-pricing",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminQuantityPricing />
          </ProtectedRoute>
        )
      },

      {
        path: "quantity-pricing/add",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddQuantityPrice />
          </ProtectedRoute>
        )
      },

      {
        path: "quantity-pricing/edit/:subcategoryId/:priceId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditQuantityPrice />
          </ProtectedRoute>
        )
      },
            {
        path: "quantity-pricing/view/:subcategoryId/:priceId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewQuantityPrice  />
          </ProtectedRoute>
        )
      },
      {
        path: "products",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminProducts />
          </ProtectedRoute>
        )
      },
      {
        path: "products/add",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddProduct />
          </ProtectedRoute>
        )
      },
      {
        path: "products/edit/:productId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditProduct />
          </ProtectedRoute>
        )
      },
      {
        path: "products/view/:productId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewProduct />
          </ProtectedRoute>
        )
      },
      {
        path: "categories",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCategories />
          </ProtectedRoute>
        )
      },
      {
        path: "categories/add",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddCategory />
          </ProtectedRoute>
        )
      },
      {
        path: "categories/edit/:categoryId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditCategory />
          </ProtectedRoute>
        )
      },
      {
        path: "categories/view/:categoryId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewCategory />
          </ProtectedRoute>
        )
      },
      {
        path: "subcategories",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminSubCategories />
          </ProtectedRoute>
        )
      },
      {
        path: "subcategories/add",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddSubCategory />
          </ProtectedRoute>
        )
      },
      {
        path: "subcategories/edit/:subcategoryId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditSubCategory />
          </ProtectedRoute>
        )
      },
      {
        path: "subcategories/view/:subcategoryId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewSubCategory />
          </ProtectedRoute>
        )
      },

            {
        path: "products/customization/:productId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCustomization />
          </ProtectedRoute>
        )
      },
      {
        path: "products/customization/add/:productId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CustomizationForm />
          </ProtectedRoute>
        )
      },
      {
        path: "products/customization/edit/:customizationId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CustomizationForm />
          </ProtectedRoute>
        )
      },
      {
        path: "products/customization/view/:subcategoryId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewSubCategory />
          </ProtectedRoute>
        )
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        )
      },
      {
        path: "users/add",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddUser />
          </ProtectedRoute>
        )
      },
      {
        path: "users/edit/:userId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditUser />
          </ProtectedRoute>
        )
      },
      {
        path: "users/view/:userId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewUser />
          </ProtectedRoute>
        )
      },
      {
        path: "users/create/customer",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddCustomer />
          </ProtectedRoute>
        )
      },
      {
        path: "users/create/admin",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddAdmin />
          </ProtectedRoute>
        )
      },
      {
        path: "users/create/wholesaler",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddWholesaler />
          </ProtectedRoute>
        )
      },
      {
        path: "sliders",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminSliders />
          </ProtectedRoute>
        )
      },
      {
        path: "sliders/add",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddSlider />
          </ProtectedRoute>
        )
      },
      {
        path: "sliders/edit/:sliderId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditSlider />
          </ProtectedRoute>
        )
      },
      {
        path: "sliders/view/:sliderId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewSlider />
          </ProtectedRoute>
        )
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminOrders />
          </ProtectedRoute>
        )
      },
      {
        path: "orders/view/:orderId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewOrder />
          </ProtectedRoute>
        )
      },
      {
        path: "wholesalers",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminWholesalers />
          </ProtectedRoute>
        )
      },
      {
        path: "contacts",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminContacts />
          </ProtectedRoute>
        )
      },
            {
        path: "contacts/view/:contactId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewContact />
          </ProtectedRoute>
        )
      },
      {
        path: "ratings",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminRatings />
          </ProtectedRoute>
        )
      },
            {
        path: "ratings/view/:ratingId",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ViewRating />
          </ProtectedRoute>
        )
      },
  {
    path: "coupons",
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminCoupons />
      </ProtectedRoute>
    )
  },

{
  path: "coupons/add",
  element: (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AddCoupon />
    </ProtectedRoute>
  )
},
{
  path: "coupons/edit/:couponId",
  element: (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <EditCoupon />
    </ProtectedRoute>
  )
},
{
  path: "coupons/view/:couponId",
  element: (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <ViewCoupon />
    </ProtectedRoute>
  )
},
      {
        path: "wholesaler-applications",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <WholesalerApplications />
          </ProtectedRoute>
        )
      },

      // Wholesaler Routes

      {
        path: "wholesaler/products",
        element: (
          <ProtectedRoute allowedRoles={['WHOLESALER']}>
            <WholesalerProducts />
          </ProtectedRoute>
        )
      },
      {
        path: "wholesaler/orders",
        element: (
          <ProtectedRoute allowedRoles={['WHOLESALER']}>
            <WholesalerOrders />
          </ProtectedRoute>
        )
      },

      // User Routes

    ]
  },
    {
        path: "user",
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <UserDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "user/profile",
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <UserProfile />
          </ProtectedRoute>
        )
      },
      {
        path: "user/wishlist",
        element: (
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <UserWishlist />
          </ProtectedRoute>
        )
      },
    {
      path: "/payment-success",
      element: (
        <ProtectedRoute allowedRoles={['CUSTOMER', 'WHOLESALER']}>
          <OrderSuccess />
        </ProtectedRoute>
      )
    }
]);