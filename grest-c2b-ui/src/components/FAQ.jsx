import React, { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
const FAQ = () => {
  const currentDomain = window.location.origin;
  const WEBSITE_SHORT_NAME = currentDomain === import.meta.env.VITE_BUYBACK_URL ? import.meta.env.VITE_BUYBACK_SHORT_NAME : import.meta.env.VITE_WEBSITE_SHORT_NAME;
  const faqData = [
    {
      question: "How did you calculate my device price?",
      answer:
        "Your price is calculated by determining the condition and working of your phone",
    },
    {
      question: `Is it safe to sell my phone on ${WEBSITE_SHORT_NAME}?`,
      answer: `Yes, it is 100% safe to sell your phone on ${WEBSITE_SHORT_NAME}`,
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="max-w-2xl mx-auto mt-2">
      {faqData.map((item, index) => (
        <div key={index} className="mb-4">
          <div
            className={`flex items-center justify-between p-4 cursor-pointer border rounded ${
              openIndex === index ? "bg-gray-300" : "bg-gray-100"
            }`}
            onClick={() => toggleAnswer(index)}
          >
            <div className="text-gray-800 font-semibold">{item.question}</div>
            <div>
              {openIndex === index ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
            </div>
          </div>
          {openIndex === index && (
            <div className="p-4 bg-white border rounded-b">
              <p className="text-gray-800">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQ;
