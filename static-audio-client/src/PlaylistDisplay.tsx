import { useTheme } from '@mui/material/styles';
import {   Card,  CardHeader, Typography,Avatar, } from '@mui/material';
import { Download} from '@mui/icons-material';

import { PlaylistDef} from "shared";

export interface PlaylistDisplaySpec {
    playlist:PlaylistDef
    mediaRoot:string
}
export default (props:PlaylistDisplaySpec) => {
    const pd = props.playlist as PlaylistDef
    const theme = useTheme()
    return (
        <Card color={theme.palette.primary.light} sx={{"height":300}}> 
            <CardHeader 
                title={<>
                    <Typography variant="h4" color="primary" align="left">{pd.name}</Typography>
                    {pd.image_url ? <Avatar src={props.mediaRoot + "/" +pd.image_url} variant="rounded" sx={{ width: 200, height: 200 }}/> : ""}
                    </>}
                action={
                <div>
                    {pd.archive_url ? <a href={props.mediaRoot + "/" + pd.archive_url}><Download color='primary'/></a> : <Download color='disabled'/>}
                </div>}
                    >
            </CardHeader>
        </Card>
    )
}