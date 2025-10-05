import SnapshotCompletedView from "src/sections/snapshot/snapshot-completed"

export const metadata = {
    title: 'Congrats! Your snapshot is complete!',
}
interface Params {
    id: string;
  }

export default function SnapshotCompletedPage({params} : {params: Params}) {
    const { id } = params;

    return (
        <SnapshotCompletedView id={id}  />
    )
}