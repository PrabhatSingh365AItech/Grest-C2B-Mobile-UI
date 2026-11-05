import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInterceptor'
import { USER_ROLES } from '../constants/roleConstants'

const useNavigationHandlers = (setsideMenu, sideMenu, profile) => {
  const navigate = useNavigate()

  const createNavigationHandler = (path) => () => {
    setsideMenu(!sideMenu)
    navigate(path)
  }

  const handleHome = () => {
    setsideMenu(!sideMenu)
    if (profile.role === USER_ROLES.SUPER_ADMIN) {
      navigate('/adminmodels')
    } else if (
      profile.role === USER_ROLES.ADMIN_MANAGER ||
      profile.role === USER_ROLES.COMPANY_ADMIN
    ) {
      navigate('/customertable')
    } else if (profile.role === USER_ROLES.TECHNICIAN) {
      navigate('/devicepickupdashboard')
    } else if (profile.role === USER_ROLES.LOGISTICS_ADMIN) {
      navigate('/logistics')
    }
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/userregistry/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      localStorage.clear()
      sessionStorage.clear()
      navigate('/')
    }
  }

  return {
    handleHome,
    handleTable: createNavigationHandler('/customertable'),
    handleGrade: createNavigationHandler('/gradepricingsheet'),
    handleProfile: createNavigationHandler('/profile'),
    handleRegister: createNavigationHandler('/registeruser'),
    handleStoreListing: createNavigationHandler('/storelisting'),
    handleCompanyListing: createNavigationHandler('/companylisting'),
    handleTechnician: createNavigationHandler('/technicianwisereport'),
    handleStoreReport: createNavigationHandler('/storewisereport'),
    adminDashboard: createNavigationHandler('/admindashboard'),
    handlpickup: createNavigationHandler('/devicepickupdashboard'),
    handleLogistics: createNavigationHandler('/logistics'),
    handleBulkUploadHistory: createNavigationHandler('/bulkuploadhistory'),
    handleQuoteTracking: createNavigationHandler('/quotetrackingdashboard'),
    handleCouponManagement: createNavigationHandler('/coupondetails'),
    handleDynamicPricing: createNavigationHandler('/dynamic-pricing'),
    handleLogout,
  }
}

function SideMenu({ setsideMenu, sideMenu }) {
  const profile = JSON.parse(sessionStorage.getItem('profile'))

  const handlers = useNavigationHandlers(setsideMenu, sideMenu, profile)
  return (
    <>
      {(profile.role === USER_ROLES.SUPER_ADMIN ||
        profile.role === USER_ROLES.COMPANY_ADMIN ||
        profile.role === USER_ROLES.SUPER_ADMIN_UNICORN) && (
        <SuperAdminProfile sideMenu={sideMenu} profile={profile} {...handlers} />
      )}
      {(profile.role === USER_ROLES.ADMIN_MANAGER ||
        profile.role === USER_ROLES.ADMIN_MANAGER_UNICORN) && (
        <AdminManagerMenu sideMenu={sideMenu} {...handlers} />
      )}
      {profile.role === USER_ROLES.TECHNICIAN && (
        <TechnicianMenu sideMenu={sideMenu} {...handlers} />
      )}
      {profile.role === USER_ROLES.LOGISTICS_ADMIN && (
        <WarehouseMenu sideMenu={sideMenu} {...handlers} />
      )}
    </>
  )
}

export default SideMenu

// Slide-in side menu panel; shifted on screen when the menu is open.
const MENU_PANEL_CLASS =
  'menu fixed left-[-200px] top-0 w-[200px] h-full bg-slate-300 z-50 flex items-start justify-center overflow-y-auto transition-all duration-950 ease-in '

// Panel and list shared by every role's menu.
const MenuPanel = ({ sideMenu, children }) => (
  <div className={MENU_PANEL_CLASS + (sideMenu && 'left-[0]')}>
    <ul className='list-none flex flex-col pl-[6%] pt-[10%] pb-10 justify-start gap-[2vh] w-full'>
      {children}
    </ul>
  </div>
)

const MenuItem = ({ onClick, children }) => (
  <li className='text-[20px] font-[300] cursor-pointer' onClick={onClick}>
    {children}
  </li>
)

const AdminManagerMenu = ({
  sideMenu,
  handleHome,
  handleProfile,
  handleRegister,
  handlpickup,
  handleStoreReport,
  handleQuoteTracking,
  handleTechnician,
  adminDashboard,
  handleLogout,
}) => (
  <MenuPanel sideMenu={sideMenu}>
    <MenuItem onClick={handleHome}>Home</MenuItem>
    <MenuItem onClick={handleProfile}>Profile</MenuItem>
    <MenuItem onClick={handleRegister}>Register User</MenuItem>
    <MenuItem onClick={handlpickup}>Pickup & Cancel Device</MenuItem>
    <MenuItem onClick={handleStoreReport}>Store Report</MenuItem>
    <MenuItem onClick={handleQuoteTracking}>Quote Tracking</MenuItem>
    <MenuItem onClick={handleTechnician}>Technician Report</MenuItem>
    <MenuItem onClick={adminDashboard}>Admin Dashboard</MenuItem>
    <MenuItem onClick={handleLogout}>Logout</MenuItem>
  </MenuPanel>
)

const WarehouseMenu = ({
  sideMenu,
  handleHome,
  handleProfile,
  handleLogistics,
  handleLogout,
}) => (
  <MenuPanel sideMenu={sideMenu}>
    <MenuItem onClick={handleHome}>Home</MenuItem>
    <MenuItem onClick={handleProfile}>Profile</MenuItem>
    <MenuItem onClick={handleLogistics}>Warehouse</MenuItem>
    <MenuItem onClick={handleLogout}>Logout</MenuItem>
  </MenuPanel>
)

const TechnicianMenu = ({ sideMenu, handleHome, handleProfile, handleLogout }) => (
  <MenuPanel sideMenu={sideMenu}>
    <MenuItem onClick={handleHome}>Home</MenuItem>
    <MenuItem onClick={handleProfile}>Profile</MenuItem>
    <MenuItem onClick={handleLogout}>Logout</MenuItem>
  </MenuPanel>
)

const SuperAdminProfile = ({
  sideMenu,
  profile,
  handleHome,
  handleProfile,
  handleGrade,
  handleRegister,
  handleStoreListing,
  handleStoreReport,
  handleTable,
  handleCompanyListing,
  handlpickup,
  handleLogistics,
  handleTechnician,
  adminDashboard,
  handleLogout,
  handleBulkUploadHistory,
  handleQuoteTracking,
  handleCouponManagement,
  handleDynamicPricing,
}) => {
  const isCompanyAdmin = profile.role === USER_ROLES.COMPANY_ADMIN
  const isSuperAdmin = profile.role === USER_ROLES.SUPER_ADMIN
  return (
    <MenuPanel sideMenu={sideMenu}>
      <MenuItem onClick={handleHome}>Home</MenuItem>
      <MenuItem onClick={handleProfile}>Profile</MenuItem>
      {!isCompanyAdmin && <MenuItem onClick={handleGrade}>Grade Pricing</MenuItem>}
      <MenuItem onClick={handleRegister}>Register User</MenuItem>
      <MenuItem onClick={handleBulkUploadHistory}>Bulk Upload History</MenuItem>
      <MenuItem onClick={handleStoreListing}>Store Listing</MenuItem>
      <MenuItem onClick={handleStoreReport}>Store Report</MenuItem>
      <MenuItem onClick={handleQuoteTracking}>Quote Tracking</MenuItem>
      {!isCompanyAdmin && <MenuItem onClick={handleCouponManagement}>Coupon Management</MenuItem>}
      <MenuItem onClick={handleTable}>Customer Table</MenuItem>
      {!isCompanyAdmin && <MenuItem onClick={handleCompanyListing}>Company Listing</MenuItem>}
      {!isCompanyAdmin && <MenuItem onClick={handleDynamicPricing}>Dynamic Pricing</MenuItem>}
      <MenuItem onClick={handlpickup}>Pickup & Cancel Device</MenuItem>
      {isSuperAdmin && <MenuItem onClick={handleLogistics}>Warehouse & Logistics</MenuItem>}
      <MenuItem onClick={handleTechnician}>Technician Report</MenuItem>
      <MenuItem onClick={adminDashboard}>Admin Dashboard</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </MenuPanel>
  )
}
