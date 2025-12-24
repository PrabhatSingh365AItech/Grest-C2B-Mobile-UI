import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { setupGlobalInterceptors } from './utils/axiosInterceptor'
import './App.css'
import SelectBrand from './pages/SelectBrand'
import InputNumber from './pages/InputNumber'
import DeviceDetails from './pages/DeviceDetails'
import Login from './pages/Login'
import DeviceInformation from './pages/DeviceInformation'
import Price from './pages/Price'
import { Provider } from 'react-redux'
import store from './store/store'
import Register from './pages/Register'
import { AnswerProvider } from './components/AnswerContext'
import { QuestionProvider } from './components/QuestionContext'
import CustomerTable from './pages/CustomerTable'
import SpecialOffers from './pages/SpecialOffers'
import PurchaseReceipt from './components/PurchaseReceipt'
import AdminHome from './pages/AdminHome'
import AdminFinalGrade from './pages/AdminFinalGrade'
import GradePricingSheet from './pages/GradePricingSheet'
import AdminLogin from './pages/AdminLogin'
import SelectDeviceType from './pages/SelectDeviceType/SelectDeviceType'
import SelectDevice from './pages/SelectDevice/SelectDevice'
import SelectModel from './pages/SelectModel/SelectModel'
import ForgetPassword from './pages/ForgetPassword'
import DeviceQuote from './pages/DeviceQuote.jsx/DeviceQuote'
import NewDeviceqs from './pages/DeviceDetailnew/NewDeviceqs'
import ProductSold from './pages/ProductSold'
import QuickQuote from './pages/QuickQuote/QuickQuote'
import DevicePickupDashboard from './pages/DevicePickupDashboard/DevicePickupDashboard'
import PickedUpDevices from './pages/PickedUpDevices/PickedUpDevices'
import ViewPickup from './pages/ViewPickup/ViewPickup'
import PickupHistory from './components/PickupHistory/PickupHistory'
import Profile from './pages/Profile/Profile'
import RegisterUser from './pages/RegisterUser/RegisterUser'
import StoreListing from './pages/StoreListing/StoreListing'
import CompanyListing from './pages/CompanyListing/CompanyListing'
import OutStandingDevices from './pages/OutStandingDevices/OutStandingDevices'
import Offers from './pages/Offers/Offers'
import ViewOfferDetail from './pages/ViewOfferDetail/ViewOfferDetail'
import StoreWiseReport from './pages/StoreWiseReport/StoreWiseReport'
import TechnicianWiseReport from './pages/TechnicianWiseReport/TechnicianWiseReport'
import RegisterUserDetails from './pages/RegisterUserDetails/RegisterUserDetails'
import OrdersCreated from './pages/OrdersCreated/OrdersCreated'
import QuotesCreated from './pages/QuotesCreated/QuotesCreated'
import OrdersCompleted from './pages/OrdersCompleted/OrdersCompleted'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import StoreListingTable from './pages/StoreListingTable/StoreListingTable'
import CompanyListingDetails from './pages/CompanyListingDetails/CompanyListingDetails'
import AdminModels from './pages/AdminModels/AdminModels'
import QuotesCreatedAdmin from './pages/QuotesCreatedAdmin/QuotesCreatedAdmin'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import LeadsCompleted from './pages/LeadsCompleted/LeadsCompleted'
import Categories from './pages/Categories/Categories'
import Watchqs from './pages/Watch_Exact_qs/Watch_qs'
import Orders from './pages/Orders/Orders'
import BulkUploadHistory from './pages/BulkUploadHistory'
import QuoteTrackingDashboard from './pages/QuoteTrackingDashboard'
import ThankYou from './pages/ThankYou'
import CreateCoupon from './pages/CreateCoupon'
import CouponDetails from './pages/CouponDetails'

function App() {
  // Setup global axios interceptors on app mount
  useEffect(() => {
    setupGlobalInterceptors();
  }, []);

  return (
    <>
      <AnswerProvider>
        <QuestionProvider>
          <Provider store={store}>
            <Router>
              <Routes>
                <Route path='/selectPhone' element={<SelectBrand />}></Route>
                <Route path='/devicedetail' element={<DeviceDetails />}></Route>

                <Route
                  path='/deviceinfo'
                  element={<DeviceInformation />}
                ></Route>

                <Route path='/inputnumber' element={<InputNumber />} />
                <Route path='/thankyou' element={<ThankYou />} />

                <Route path='/' element={<Login />}></Route>

                <Route path='/register' element={<Register />}></Route>
                <Route path='/adminlogin' element={<AdminLogin />}></Route>

                <Route
                  path='/customertable'
                  element={<CustomerTable />}
                ></Route>
                <Route path='/adminhome' element={<AdminHome />}></Route>
                <Route path='/adminmodels' element={<AdminModels />}></Route>
                <Route
                  path='/adminfinalgrade'
                  element={<AdminFinalGrade />}
                ></Route>
                <Route
                  path='/gradepricingsheet'
                  element={<GradePricingSheet />}
                ></Route>
                <Route
                  path='/specialoffers'
                  element={<SpecialOffers />}
                ></Route>
                <Route path='/Reciept' element={<PurchaseReceipt />}></Route>
                <Route path='/pricepage' element={<Price />}></Route>
                <Route
                  path='/selectdevicetype'
                  element={<SelectDeviceType />}
                ></Route>
                <Route
                  path='/selectdevice/:brandId'
                  element={<SelectDevice />}
                ></Route>
                <Route path='/selectmodel' element={<SelectModel />}></Route>
                <Route path='/devicequote' element={<DeviceQuote />}></Route>
                <Route path='/quickquote' element={<QuickQuote />}></Route>
                <Route
                  path='/PasswordRecovery'
                  element={<ForgetPassword />}
                ></Route>
                <Route
                  path='/device/Qestions'
                  element={<NewDeviceqs />}
                ></Route>
                <Route path='/productsold' element={<ProductSold />}></Route>
                <Route
                  path='/devicepickupdashboard'
                  element={<DevicePickupDashboard />}
                ></Route>
                <Route
                  path='/pickedupdevices'
                  element={<PickedUpDevices />}
                ></Route>
                <Route
                  path='/outstanding'
                  element={<OutStandingDevices />}
                ></Route>
                <Route path='/viewpickup' element={<ViewPickup />}></Route>
                <Route
                  path='/pickuphistory'
                  element={<PickupHistory />}
                ></Route>
                <Route path='/profile' element={<Profile />}></Route>
                <Route path='/registeruser' element={<RegisterUser />}></Route>
                <Route
                  path='/registeruserdetails'
                  element={<RegisterUserDetails />}
                ></Route>
                <Route path='/storelisting' element={<StoreListing />}></Route>
                <Route
                  path='/storelistingtable'
                  element={<StoreListingTable />}
                ></Route>
                <Route
                  path='/companylisting'
                  element={<CompanyListing />}
                ></Route>
                <Route path='/offers' element={<Offers />}></Route>
                <Route
                  path='/viewofferdetail'
                  element={<ViewOfferDetail />}
                ></Route>
                <Route
                  path='/storewisereport'
                  element={<StoreWiseReport />}
                ></Route>
                <Route
                  path='/technicianwisereport'
                  element={<TechnicianWiseReport />}
                ></Route>
                <Route
                  path='/orderscreated/:daysfilter'
                  element={<OrdersCreated />}
                ></Route>
                <Route
                  path='/quotescreated/:daysfilter'
                  element={<QuotesCreated />}
                ></Route>
                <Route
                  path='/orderscompleted/:daysfilter/'
                  element={<OrdersCompleted />}
                ></Route>
                <Route
                  path='/changepassword'
                  element={<ChangePassword />}
                ></Route>
                <Route
                  path='/companylistingdetails'
                  element={<CompanyListingDetails />}
                ></Route>
                <Route
                  path='/quotescreated'
                  element={<QuotesCreatedAdmin />}
                ></Route>
                <Route
                  path='/leadscompleted'
                  element={<LeadsCompleted />}
                ></Route>
                <Route
                  path='/admindashboard'
                  element={<AdminDashboard />}
                ></Route>
                <Route path='/BrandList' element={<Categories />}></Route>
                <Route path='/watchQs' element={<Watchqs />}></Route>
                <Route path='/Orders/:daysfilter' element={<Orders />}></Route>
                <Route
                  path='/bulkuploadhistory'
                  element={<BulkUploadHistory />}
                ></Route>
                <Route
                  path='/quotetrackingdashboard'
                  element={<QuoteTrackingDashboard />}
                ></Route>
                <Route path='/createcoupon' element={<CreateCoupon />}></Route>
                <Route path='/editcoupon/:id' element={<CreateCoupon />}></Route>
                <Route path='/coupondetails' element={<CouponDetails />}></Route>
              </Routes>
            </Router>
            <Toaster
              position='top-center'
              toastOptions={{
                style: {
                  marginTop: '60px', // adjust as needed
                },
              }}
            />
          </Provider>
        </QuestionProvider>
      </AnswerProvider>
    </>
  )
}

export default App
