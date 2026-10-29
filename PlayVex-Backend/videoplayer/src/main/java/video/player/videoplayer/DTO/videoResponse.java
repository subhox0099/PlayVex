package video.player.videoplayer.DTO;

public class videoResponse {

    private Long id;
    private String title;
    private String description;
    private String fileName;
    private String contentType;
    private Long filesize;
    private Long views;

    public videoResponse(
            Long id,
            String title,
            String description,
            String fileName,
            String contentType,
            Long filesize,
            Long views) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.fileName = fileName;
        this.contentType = contentType;
        this.filesize = filesize;
        this.views = views;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getFilesize() {
        return filesize;
    }

    public Long getViews() {
        return views;
    }
}