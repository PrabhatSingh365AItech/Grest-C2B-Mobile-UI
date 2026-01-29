import styles from './RegisterUserDetails.module.css'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdAdd,
  IoMdSearch,
} from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { FaDownload } from 'react-icons/fa6'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import RegisterUserEdit from '../../components/RegisterUserEdit/RegisterUserEdit'
import { useNavigate } from 'react-router-dom'

const succTextColor = 'text-green-500'
const failTextColor = 'text-primary'

const downloadExcel = (dataDown) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const formattedData = dataDown.map((item) => {
    return {
      'User Id': item._id,
      'Date Created': new Date(item.createdAt).toLocaleDateString('en-GB'),
      'User Name': `${item?.firstName} ${item?.lastName}`,
      'User Email': item.email,
      'Phone Number': item.phoneNumber,
      [`${import.meta.env.VITE_WEBSITE_TITLE} Member`]: item.grestMember,
      'Company Name': item.companyData?.name || 'N/A',
      'Company Code': item.companyData?.companyCode || 'N/A',
      Role: item.role,
      'Assigned Stores Count': item.assignedStoreNames?.length || 0,
      'Assigned Stores': item.assignedStoreNames?.join(', ') || 'N/A',
      'Store Name': item.stores?.storeName,
      Region: item.stores?.region,
      Address: item.address,
    }
  })

  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  const dataFile = new Blob([excelBuffer], { type: fileType })
  saveAs(dataFile, 'Users_Data' + fileExtension)
}

const useUserData = (token) => {
  const [data, setData] = useState([])
  const [companies, setCompanies] = useState([])
  const [isTableLoaded, setIsTableLoaded] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [storeValue, setStoreValue] = useState('')
  const [roleValue, setRoleValue] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')

  const getData = () => {
    setIsTableLoaded(true)
    const config = {
      method: 'get',
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/all`,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        setData(response.data.data)
        setIsTableLoaded(false)
      })
      .catch(() => {
        setIsTableLoaded(false)
      })
  }

  const getDataBySearch = () => {
    setIsTableLoaded(true)
    let url = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/userregistry/search?uid=${searchValue}&storeName=${storeValue}&role=${roleValue}`

    if (companyFilter) {
      url += `&companyId=${companyFilter}`
    }

    const config = {
      method: 'get',
      url: url,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        setData(response.data.data)
        setIsTableLoaded(false)
      })
      .catch(() => {
        setIsTableLoaded(false)
      })
  }

  const getCompanies = () => {
    const config = {
      method: 'get',
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll`,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        setCompanies(response.data.result || [])
      })
      .catch((error) => {
        console.log('Failed to load companies:', error)
      })
  }

  const handleSearchClick = () => {
    getDataBySearch()
  }

  const handleSearchClear = () => {
    setSearchValue('')
    setStoreValue('')
    setRoleValue('')
    setCompanyFilter('')
    getData()
  }

  useEffect(() => {
    getData()
    getCompanies()
  }, [])

  useEffect(() => {
    if (companyFilter !== '') {
      getDataBySearch()
    } else if (
      companyFilter === '' &&
      searchValue === '' &&
      storeValue === '' &&
      roleValue === ''
    ) {
      getData()
    }
  }, [companyFilter])

  return {
    data,
    companies,
    isTableLoaded,
    searchValue,
    setSearchValue,
    storeValue,
    setStoreValue,
    roleValue,
    setRoleValue,
    companyFilter,
    setCompanyFilter,
    getData,
    getDataBySearch,
    handleSearchClick,
    handleSearchClear,
  }
}

const useUserOperations = (token, getDataBySearch) => {
  const [userEditData, setUserEditData] = useState()
  const [editBoxOpen, setEditBoxOpen] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [selectedUser, setSelectedUser] = useState()
  const [selectedEmail, setSelectedEmail] = useState()
  const [errMsg, setErrMsg] = useState('')
  const [sucBox, setSucBox] = useState(false)
  const [failBox, setFailBox] = useState(false)
  const [confBox, setConfBox] = useState(false)

  const editHandler = (userData) => {
    setUserEditData(userData)
    setEditBoxOpen(true)
  }

  const deleteConfHandler = (userID, userEmail) => {
    setSelectedUser(userID)
    setSelectedEmail(userEmail)
    setConfBox(true)
  }

  const deleteHandler = (userID) => {
    setConfBox(false)
    const config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/delete`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: { userID },
    }
    axios
      .request(config)
      .then(() => {
        getDataBySearch()
        setErrMsg(`Succesfully deleted user with email - ${selectedEmail}`)
        setSucBox(true)
      })
      .catch(() => {
        setErrMsg('Failed to deleted user with email - ' + selectedEmail)
        setFailBox(true)
      })
  }

  useEffect(() => {
    if (editBoxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'visible'
    }
  }, [editBoxOpen])

  return {
    userEditData,
    editBoxOpen,
    setEditBoxOpen,
    editSuccess,
    setEditSuccess,
    selectedUser,
    errMsg,
    setErrMsg,
    sucBox,
    setSucBox,
    failBox,
    setFailBox,
    confBox,
    setConfBox,
    editHandler,
    deleteConfHandler,
    deleteHandler,
  }
}

const RegisterUserDetails = () => {
  const token = sessionStorage.getItem('authToken')
  const [sideMenu, setsideMenu] = useState(false)

  const userData = useUserData(token)
  const userOps = useUserOperations(token, userData.getDataBySearch)

  useEffect(() => {
    if (userOps.editSuccess) {
      userData.getData()
      userOps.setErrMsg('Succesfully updated user details')
      userOps.setSucBox(true)
      userOps.setEditSuccess(false)
      userOps.setEditBoxOpen(false)
    }
  }, [userOps.editSuccess])

  return (
    <div>
      {userOps.editBoxOpen && (
        <div className={`${styles.edit_page}`}>
          <RegisterUserEdit
            userData={userOps.userEditData}
            setEditBoxOpen={userOps.setEditBoxOpen}
            setEditSuccess={userOps.setEditSuccess}
          />
        </div>
      )}
      <div className='flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER '>
        <div className='navbar'>
          <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
          <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
        </div>
      </div>
      {userOps.sucBox && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <div className={`${styles.err_mod_box} ${succTextColor}`}>
            <IoIosCheckmarkCircle className={succTextColor} size={90} />
            <h6 className={succTextColor}>Success!</h6>
            <p className='text-slate-500'>{userOps.errMsg}</p>
            <button
              onClick={() => userOps.setSucBox(false)}
              className={'text-white bg-green-500'}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {userOps.failBox && <FailBox errMsg={userOps.errMsg} setFailBox={userOps.setFailBox} />}
      {userOps.confBox && (
        <ConfBox
          selectedEmail={userOps.selectedEmail}
          deleteHandler={userOps.deleteHandler}
          selectedUser={userOps.selectedUser}
          setConfBox={userOps.setConfBox}
        />
      )}
      {userData.isTableLoaded && (
        <div className='fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={userData.isTableLoaded}
            size={15}
          />
        </div>
      )}
      <TableFilters
        setSearchValue={userData.setSearchValue}
        searchValue={userData.searchValue}
        handleSearchClick={userData.handleSearchClick}
        handleSearchClear={userData.handleSearchClear}
        storeValue={userData.storeValue}
        setRoleValue={userData.setRoleValue}
        roleValue={userData.roleValue}
        setStoreValue={userData.setStoreValue}
        companyFilter={userData.companyFilter}
        setCompanyFilter={userData.setCompanyFilter}
        companies={userData.companies}
        data={userData.data}
      />
      <RegisterUserTable
        data={userData.data}
        editHandler={userOps.editHandler}
        deleteConfHandler={userOps.deleteConfHandler}
      />
    </div>
  )
}

export default RegisterUserDetails

const FailBox = ({ errMsg, setFailBox }) => {
  return (
    <div className='fixed top-0 left-0 z-50 justify-center flex items-center w-full h-full bg-black bg-opacity-50'>
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <IoIosCloseCircle size={90} className={failTextColor} />
        <h6 className={failTextColor}>Error!</h6>
        <p className='text-slate-500'>{errMsg}</p>
        <button
          onClick={() => {
            setFailBox(false)
          }}
          className={'bg-primary text-white'}
        >
          Okay
        </button>
      </div>
    </div>
  )
}
const ConfBox = ({
  selectedEmail,
  deleteHandler,
  selectedUser,
  setConfBox,
}) => {
  return (
    <div className='fixed z-50 top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>Confirmation!</h6>
        <p className='text-slate-500'>
          {`Do you want to delete user with email - ${selectedEmail} ?`}
        </p>
        <div className='flex flex-row gap-2'>
          <button
            onClick={() => deleteHandler(selectedUser)}
            className={'bg-primary text-white'}
          >
            Okay
          </button>
          <button
            onClick={() => setConfBox(false)}
            className='bg-white text-primary'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const TableFilters = ({
  setSearchValue,
  searchValue,
  handleSearchClick,
  handleSearchClear,
  setRoleValue,
  roleValue,
  storeValue,
  setStoreValue,
  companyFilter,
  setCompanyFilter,
  companies,
  data,
}) => {
  const LoggedInUser = JSON.parse(sessionStorage.getItem('profile'))
  const isSuperAdmin = LoggedInUser?.role === 'Super Admin'
  const navigate = useNavigate()

  return (
    <div className='m-2 flex flex-col gap-2 items-center w-[100%]'>
      <div className='flex gap-2 items-center justify-center outline-none mt-5 w-[100%]'>
        <button
          className={`${styles.bulkdown_button}`}
          onClick={() => {
            navigate('/registeruser')
          }}
        >
          <IoMdAdd /> Add User
        </button>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            className='text-sm'
            type='text'
            placeholder='Search Name/Email/Number/UserId'
            value={searchValue}
          />
          <IoMdSearch onClick={handleSearchClick} size={25} />
        </div>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setRoleValue(e.target.value)}
            className='text-sm'
            type='text'
            placeholder='Search role'
            value={roleValue}
          />
          <IoMdSearch onClick={handleSearchClick} size={25} />
        </div>
        {isSuperAdmin && (
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setStoreValue(e.target.value)}
              className='text-sm'
              type='text'
              placeholder='Search Store'
              value={storeValue}
            />
            <IoMdSearch onClick={handleSearchClick} size={25} />
          </div>
        )}
        <div className={styles.icons_box}>
          <IoRefresh onClick={handleSearchClear} className='' size={25} />
        </div>
        <button
          className={`${styles.bulkdown_button}`}
          onClick={() => downloadExcel(data)}
        >
          <FaDownload /> Bulk Download
        </button>
      </div>

      {/* Company Filter */}
      {isSuperAdmin && (
        <div className='flex gap-2 items-center max-w-md'>
          <label className='text-sm font-medium whitespace-nowrap'>
            Filter by Company:
          </label>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className='text-sm bg-transparent border border-gray-300 rounded px-3 py-2 w-64'
          >
            <option value=''>All Companies</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name} ({company.companyCode})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

const renderStoreField = (val, field) => {
  const hasMultiple = val?.assignedStoresData?.length > 0
  const hasSingle = val?.stores && !hasMultiple

  if (hasMultiple) {
    return val.assignedStoresData.map((store, i) => (
      <div key={i} className='border-b py-1 last:border-b-0'>
        {store[field]}
      </div>
    ))
  }

  if (hasSingle) {
    return val.stores[field]
  }

  return 'N/A'
}

const RegisterUserTable = ({ data, editHandler, deleteConfHandler }) => {
  return (
    <div className='m-2 overflow-x-auto md:m-5'>
      <table className='w-full border border-primary'>
        <thead className='bg-primary text-white'>
          <tr>
            <th className='p-2 text-sm md:p-3 md:text-base'>Action</th>
            <th className='p-2 text-sm md:p-3 md:text-base'>Name</th>
            <th className='p-2 text-sm md:p-3 md:text-base'>Email</th>
            <th className='p-2 min-w-[140px] text-sm md:p-3 md:text-base'>
              Phone Number
            </th>
            <th className='p-2 min-w-[140px] text-sm md:p-3 md:text-base'>
              Company Name
            </th>
            <th className='p-2 min-w-[140px] text-sm md:p-3 md:text-base'>
              Company Code
            </th>
            <th className='p-2 text-sm md:p-3 md:text-base'>Role</th>
            <th className='p-2 text-sm md:p-3 md:text-base'>Store Name</th>
            <th className='p-2 text-sm md:p-3 md:text-base'>Region</th>
            <th className='p-2 text-sm md:p-3 md:text-base'>Address</th>
          </tr>
        </thead>

        <tbody>
          {data.map((val, index) => {
            return (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-200' : ''}>
                {/* ACTION BUTTONS */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  <div className='flex flex-col gap-1'>
                    <button
                      className={`${styles.view_btn}`}
                      onClick={() => editHandler(val)}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.acpt_btn}`}
                      onClick={() => deleteConfHandler(val?._id, val?.email)}
                    >
                      Delete
                    </button>
                  </div>
                </td>

                {/* NAME */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {`${val?.firstName} ${val?.lastName || ''}`}
                </td>

                {/* EMAIL */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.email}
                </td>

                {/* PHONE */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.phoneNumber}
                </td>

                {/* COMPANY */}
                <td className='p-2 min-w-[200px] text-sm text-center md:p-3 md:text-base'>
                  {val?.companyData?.name || 'N/A'}
                </td>

                {/* COMPANY CODE */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.companyData?.companyCode || 'N/A'}
                </td>

                {/* ROLE */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.role}
                </td>

                {/* STORE NAME */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {renderStoreField(val, 'storeName')}
                </td>

                {/* REGION */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {renderStoreField(val, 'region')}
                </td>

                {/* ADDRESS */}
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {renderStoreField(val, 'address')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
