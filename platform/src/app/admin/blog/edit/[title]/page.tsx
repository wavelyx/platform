// sections

import PostCreateView from "src/sections/blog/view/post-create-view";

// ----------------------------------------------------------------------

export const metadata = {
    title: 'Dashboard: Edit a blog post',
};


interface Params {
    title: string;
}

type Props = {
    params: Params;
};



export default function PostCreatePage({ params }: Props) {
    const { title } = params;
    return <PostCreateView title={title} />;
}
