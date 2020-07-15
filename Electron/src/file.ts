import { DownloadManager } from "./downloadManager";

export class File {
    public filename : string;
    public url : string;
    public size : number;
    public startFrom : number;
    public manager : DownloadManager
    public finished = false;
    public index = 0;
}