import MarketCompletedView from "src/sections/Radiym-openbook/completed";


export const metadata = {
    title: 'Congrats! Your market is complete!',
};

interface Params {
    id: string;
  }

export default function Page({params} : {params: Params}) {
    const { id } = params;

    return (
     <MarketCompletedView id={id} />
    )
}