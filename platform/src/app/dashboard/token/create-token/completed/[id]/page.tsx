import TokenCompletedView from 'src/sections/token/token-completed';

// ----------------------------------------------------------------------

export const metadata = {
    title: 'Congrats! You have created your token!',
};

interface Params {
    id: string;
  }
  

export default function TokenCompletedPage({params} : {params: Params}) {
    const { id } = params;

    return <TokenCompletedView id={id} />;
}
