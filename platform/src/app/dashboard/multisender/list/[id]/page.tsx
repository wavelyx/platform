import MultiSenderListView from "src/sections/multisender/view/multisender-list-view";


export const metadata = {
  title: 'wavelyz | Multisender Pending',
};

interface Params {
  id: string;
}



export default function  MultiSenderListPage({params} : {params: Params}) {

  const { id } = params;
  return <MultiSenderListView id={id}/>
};

