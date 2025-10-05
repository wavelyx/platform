import React from "react";
import MultiSenderDetailView from "src/sections/multisender/view/multisender-details-view";

export const metadata = {
  title: 'wavelyz | Multisender Details',
};

interface Params {
  id: string;
}

const MultisenderDetailPage = ({params} : {params: Params}) => {
  const { id } = params;

  return (
      <MultiSenderDetailView id={id} />
  );
};

export default MultisenderDetailPage;
