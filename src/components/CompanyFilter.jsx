import React from "react";

const CompanyFilter = ({ companyFilter, setCompanyFilter, companies }) => {
  return (
    <div className="flex gap-2 items-center max-w-md">
      <label className="text-sm font-medium whitespace-nowrap">
        Filter by Company:
      </label>
      <select
        value={companyFilter}
        onChange={(e) => setCompanyFilter(e.target.value)}
        className="text-sm bg-transparent border border-gray-300 rounded px-3 py-2 w-64"
      >
        <option value="">All Companies</option>
        {companies.map((company) => (
          <option key={company._id} value={company._id}>
            {company.name} ({company.companyCode})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CompanyFilter;
