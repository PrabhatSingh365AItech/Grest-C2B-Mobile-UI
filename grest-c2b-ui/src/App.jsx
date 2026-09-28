import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, lazy, Suspense } from 'react'
import { setupGlobalInterceptors } from './utils/axiosInterceptor'
import './App.css'
import { Provider } from 'react-redux'
import store from './store/store'
import { AnswerProvider } from './components/AnswerContext'
import { QuestionProvider } from './components/QuestionContext'
import ErrorBoundary from './components/ErrorBoundary'
import SessionTimeoutWarning from './components/SessionTimeoutWarning'
import BackgroundDownloadStatus from './components/BackgroundDownloadStatus'

// Loading fallback component
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>Loading...</div>
  </div>
)

// EAGER load critical pages (user lands here first)
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'

// LAZY load all other pages (loaded only when user navigates)
const SelectBrand = lazy(() => import('./pages/SelectBrand'))
const InputNumber = lazy(() => import('./pages/InputNumber'))
const DeviceDetails = lazy(() => import('./pages/DeviceDetails'))
const DeviceInformation = lazy(() => import('./pages/DeviceInformation'))
const Price = lazy(() => import('./pages/Price'))
const Register = lazy(() => import('./pages/Register'))
const CustomerTable = lazy(() => import('./pages/CustomerTable'))
const SpecialOffers = lazy(() => import('./pages/SpecialOffers'))
const PurchaseReceipt = lazy(() => import('./components/PurchaseReceipt'))
const AdminHome = lazy(() => import('./pages/AdminHome'))
const AdminFinalGrade = lazy(() => import('./pages/AdminFinalGrade'))
const GradePricingSheet = lazy(() => import('./pages/GradePricingSheet'))
const SelectDeviceType = lazy(() => import('./pages/SelectDeviceType/SelectDeviceType'))
const SelectDevice = lazy(() => import('./pages/SelectDevice/SelectDevice'))
const SelectModel = lazy(() => import('./pages/SelectModel/SelectModel'))
const ForgetPassword = lazy(() => import('./pages/ForgetPassword'))
const DeviceQuote = lazy(() => import('./pages/DeviceQuote.jsx/DeviceQuote'))
const NewDeviceqs = lazy(() => import('./pages/DeviceDetailnew/NewDeviceqs'))
const ProductSold = lazy(() => import('./pages/ProductSold'))
const QuickQuote = lazy(() => import('./pages/QuickQuote/QuickQuote'))
const DevicePickupDashboard = lazy(() => import('./pages/DevicePickupDashboard/DevicePickupDashboard'))
const PickedUpDevices = lazy(() => import('./pages/PickedUpDevices/PickedUpDevices'))
const ViewPickup = lazy(() => import('./pages/ViewPickup/ViewPickup'))
const PickupHistory = lazy(() => import('./components/PickupHistory/PickupHistory'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const RegisterUser = lazy(() => import('./pages/RegisterUser/RegisterUser'))
const StoreListing = lazy(() => import('./pages/StoreListing/StoreListing'))
const CompanyListing = lazy(() => import('./pages/CompanyListing/CompanyListing'))
const DynamicPricingDashboard = lazy(() => import('./pages/DynamicPricingDashboard'))
const DynamicPricingDetails = lazy(() => import('./pages/DynamicPricingDetails'))
const OutStandingDevices = lazy(() => import('./pages/OutStandingDevices/OutStandingDevices'))
const Offers = lazy(() => import('./pages/Offers/Offers'))
const ViewOfferDetail = lazy(() => import('./pages/ViewOfferDetail/ViewOfferDetail'))
const StoreWiseReport = lazy(() => import('./pages/StoreWiseReport/StoreWiseReport'))
const TechnicianWiseReport = lazy(() => import('./pages/TechnicianWiseReport/TechnicianWiseReport'))
const RegisterUserDetails = lazy(() => import('./pages/RegisterUserDetails/RegisterUserDetails'))
const OrdersCreated = lazy(() => import('./pages/OrdersCreated/OrdersCreated'))
const QuotesCreated = lazy(() => import('./pages/QuotesCreated/QuotesCreated'))
const OrdersCompleted = lazy(() => import('./pages/OrdersCompleted/OrdersCompleted'))
const ChangePassword = lazy(() => import('./pages/ChangePassword/ChangePassword'))
const StoreListingTable = lazy(() => import('./pages/StoreListingTable/StoreListingTable'))
const CompanyListingDetails = lazy(() => import('./pages/CompanyListingDetails/CompanyListingDetails'))
const AdminModels = lazy(() => import('./pages/AdminModels/AdminModels'))
const QuotesCreatedAdmin = lazy(() => import('./pages/QuotesCreatedAdmin/QuotesCreatedAdmin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard'))
const BusinessOverview = lazy(() => import('./pages/BusinessOverview/BusinessOverview'))
const LeadsCompleted = lazy(() => import('./pages/LeadsCompleted/LeadsCompleted'))
const Categories = lazy(() => import('./pages/Categories/Categories'))
const Watchqs = lazy(() => import('./pages/Watch_Exact_qs/Watch_qs'))
const Orders = lazy(() => import('./pages/Orders/Orders'))
const BulkUploadHistory = lazy(() => import('./pages/BulkUploadHistory'))
const QuoteTrackingDashboard = lazy(() => import('./pages/QuoteTrackingDashboard'))
const ThankYou = lazy(() => import('./pages/ThankYou'))
const CreateCoupon = lazy(() => import('./pages/CreateCoupon'))
const CouponDetails = lazy(() => import('./pages/CouponDetails'))
const DeleteMyData = lazy(() => import('./pages/DeleteMyData'))

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
              <Suspense fallback={<LoadingSpinner />}>
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
                  path='/dynamic-pricing'
                  element={<ErrorBoundary><DynamicPricingDashboard /></ErrorBoundary>}
                ></Route>
                  <Route
                  path='/dynamic-pricing-details'
                  element={<ErrorBoundary><DynamicPricingDetails /></ErrorBoundary>}
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
                  <Route
                  path='/businessoverview'
                  element={<ErrorBoundary><BusinessOverview /></ErrorBoundary>}
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
                  <Route path='/delete-my-data' element={<DeleteMyData />}></Route>
                </Routes>
              </Suspense>
              <SessionTimeoutWarning />
            </Router>
            <BackgroundDownloadStatus />
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
