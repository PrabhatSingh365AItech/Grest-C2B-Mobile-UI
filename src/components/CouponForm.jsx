import Select from "react-select";

/* -------------------- Constants -------------------- */
const ERROR_BORDER_CLASS = "border-red-500";
const DEFAULT_BORDER_CLASS = "border-gray-300";
const INPUT_BASE_CLASS = "border-2 px-2 py-2 rounded-lg outline-none";

/* -------------------- Shared Components -------------------- */
const ErrorMessage = ({ message }) =>
  message ? <p className="text-red-500 text-sm mt-1">{message}</p> : null;

/* -------------------- Field Components -------------------- */
const StoreSelectField = ({ storeData, formData, handleChange, errors }) => {
  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: `${store.storeName}, ${store.region}`,
  }));

  const selectedStores = storeOptions.filter((option) =>
    formData.storeId.includes(option.value)
  );

  return (
    <label className="flex flex-col w-[70%] gap-2">
      <span className="font-medium text-xl">Store(s)*</span>
      <Select
        isMulti
        options={storeOptions}
        value={selectedStores}
        placeholder="Select one or more stores..."
        onChange={(selected) =>
          handleChange({
            target: {
              name: "storeId",
              value: selected ? selected.map((s) => s.value) : [],
            },
          })
        }
        styles={{
          control: (base) => ({
            ...base,
            borderColor: errors.storeId ? "#ef4444" : "#d1d5db",
            borderWidth: "2px",
            borderRadius: "0.5rem",
            minHeight: "46px",
            boxShadow: "none",
          }),
        }}
      />
      <ErrorMessage message={errors.storeId} />
    </label>
  );
};

const DiscountField = ({ formData, handleChange, errors }) => (
  <div className="flex flex-col w-[70%] gap-2">
    <span className="font-medium text-xl">Bonus Type*</span>
    <div className="flex gap-4">
      <select
        name="discountType"
        value={formData.discountType}
        className={`${INPUT_BASE_CLASS} w-1/2`}
        onChange={handleChange}
      >
        <option value="Fixed">Fixed (₹)</option>
        <option value="Percentage">Percentage (%)</option>
      </select>
      <input
        name="discountValue"
        value={formData.discountValue}
        onChange={handleChange}
        type="number"
        className={`${INPUT_BASE_CLASS} w-1/2 ${
          errors.discountValue ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
        }`}
      />
    </div>
    <ErrorMessage message={errors.discountValue} />
  </div>
);

const CouponCodeField = ({ formData, handleChange, errors, isCreateMode }) => (
  <label className="flex flex-col w-[70%] gap-2">
    <span className="font-medium text-xl">Coupon Code*</span>
    <input
      name="couponCode"
      value={formData.couponCode}
      onChange={handleChange}
      readOnly={!isCreateMode}
      className={`${INPUT_BASE_CLASS} ${
        errors.couponCode ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
      }`}
    />
    <ErrorMessage message={errors.couponCode} />
  </label>
);

const PriceRangeField = ({ formData, handleChange, errors }) => (
  <div className="flex flex-col w-[70%] gap-2">
    <span className="font-medium text-xl">Device Price Range (₹)*</span>
    <div className="flex gap-4">
      <input
        name="devicePriceRange.min"
        value={formData["devicePriceRange.min"]}
        onChange={handleChange}
        className={`${INPUT_BASE_CLASS} w-1/2 ${
          errors.priceRange ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
        }`}
        type="number"
      />
      <input
        name="devicePriceRange.max"
        value={formData["devicePriceRange.max"]}
        onChange={handleChange}
        className={`${INPUT_BASE_CLASS} w-1/2 ${
          errors.priceRange ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
        }`}
        type="number"
      />
    </div>
    <ErrorMessage message={errors.priceRange} />
  </div>
);

const ValidityField = ({ formData, handleChange, errors }) => (
  <div className="flex flex-col w-[70%] gap-2">
    <span className="font-medium text-xl">Validity Dates*</span>
    <div className="flex gap-4">
      <input
        name="validFrom"
        value={formData.validFrom}
        onChange={handleChange}
        type="date"
        className={`${INPUT_BASE_CLASS} w-1/2 ${
          errors.dates ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
        }`}
      />
      <input
        name="validTo"
        value={formData.validTo}
        onChange={handleChange}
        type="date"
        className={`${INPUT_BASE_CLASS} w-1/2 ${
          errors.dates ? ERROR_BORDER_CLASS : DEFAULT_BORDER_CLASS
        }`}
      />
    </div>
    <ErrorMessage message={errors.dates} />
  </div>
);

const StatusField = ({ formData, handleChange }) => (
  <label className="flex flex-col w-[70%] gap-2">
    <span className="font-medium text-xl">Status*</span>
    <select
      name="status"
      value={formData.status}
      onChange={handleChange}
      className={`${INPUT_BASE_CLASS} ${DEFAULT_BORDER_CLASS}`}
    >
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  </label>
);

/* -------------------- Main Component -------------------- */
const CouponForm = ({
  formData,
  submitHandler,
  handleChange,
  storeData,
  errors = {},
  formType = "create",
}) => {
  const isCreateMode = formType === "create";

  return (
    <form className="flex flex-col gap-5" onSubmit={submitHandler}>
      <StoreSelectField
        storeData={storeData}
        formData={formData}
        handleChange={handleChange}
        errors={errors}
      />
      <DiscountField
        formData={formData}
        handleChange={handleChange}
        errors={errors}
      />
      <CouponCodeField
        formData={formData}
        handleChange={handleChange}
        errors={errors}
        isCreateMode={isCreateMode}
      />
      <PriceRangeField
        formData={formData}
        handleChange={handleChange}
        errors={errors}
      />
      <ValidityField
        formData={formData}
        handleChange={handleChange}
        errors={errors}
      />
      <StatusField formData={formData} handleChange={handleChange} />

      <button type="submit" className="bg-primary text-white p-3 rounded">
        {isCreateMode ? "Create Coupon" : "Update Coupon"}
      </button>
    </form>
  );
};

export default CouponForm;
