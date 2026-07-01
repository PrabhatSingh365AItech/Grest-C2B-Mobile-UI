import React from "react";
import { IoCloseCircle } from "react-icons/io5";
const SummaryModal = ({
  show, onClose, price, bonus, sellingPrice, conversionFee,
  dynamicPricingEnabled, exactValue, slabBonusAmount,
  negotiatedAmount, couponDiscount, bonusMode, couponCode, isSlabApplied
}) => {
  const baseValue = Number(exactValue) - Number(slabBonusAmount);
  const total = (dynamicPricingEnabled && !isSlabApplied ? baseValue : Number(exactValue)) + Number(negotiatedAmount) + Number(couponDiscount) - Number(conversionFee)
  return (
    <div
      className={`fixed bg-white rounded-l-3xl rounded-r-3xl bottom-0 left-0 w-full p-4 transition-all 
      duration-500 ${show ? "h-[40%]" : "hidden"} overflow-hidden`}
    >
      <div>
        <div>
          <IoCloseCircle
            onClick={onClose}
            size={24}
            className="text-primary absolute top-5 right-4"
          />
        </div>
        <div>
          <p className="font-medium text-lg">Price Summary</p>
        </div>
        <div className="text-sm mx-2 ">
          <div className="font-medium mt-4 flex flex-col gap-3">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>₹{Math.round(Number(exactValue) - Number(slabBonusAmount)).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <p>Pickup Charges</p>
              <div className="flex gap-2">
                <p className="text-primary">Free</p>
                <p className="line-through">₹100</p>
              </div>
            </div>
            {negotiatedAmount > 0 && (
              <div className="flex justify-between">
                <span>Negotiated Amount</span>
                <span>+₹{negotiatedAmount}</span>
              </div>
            )}
            {dynamicPricingEnabled && isSlabApplied && Number(slabBonusAmount) > 0 && (
              <div className="flex justify-between">
                <span>Bonus Amount</span>
                <span className="text-green-600">+₹{Number(slabBonusAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span>Coupon Discount </span>
                <span>+₹{couponDiscount}</span>
              </div>
            )}

            {Number(conversionFee) > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <p>Authentication Fee</p>
                </div>
                <p className="text-red-500">-₹{conversionFee}</p>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-1">
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
      <button
        className="bg-primary fixed bottom-0 mb-4 rounded text-white px-4 py-2 mt-4"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default SummaryModal;
