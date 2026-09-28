import OrderQuoteCreated from "../../components/OrderQuoteCreated/OrderQuoteCreated";

const OrdersCreated = ({ daysfilters, head }) => {
  return (
    <OrderQuoteCreated
      orderType={"orderData"}
      daysfilters={daysfilters}
      head={head}
    />
  );
};

export default OrdersCreated;
