import OrderQuoteCreated from "../../components/OrderQuoteCreated/OrderQuoteCreated";

const QuotesCreated = ({ daysfilters, head }) => {
  return (
    <OrderQuoteCreated
      orderType={"quoteData"}
      daysfilters={daysfilters}
      head={head}
    />
  );
};

export default QuotesCreated;
