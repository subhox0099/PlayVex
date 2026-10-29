package video.player.videoplayer.Entity;

import jakarta.persistence.*;

@Entity
public class Comments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
     private String comment;
     private String author;
     @ManyToOne
     @JoinColumn(name = "video_id")
     private video video;

    public video getVideo() {
        return video;
    }

    public void setVideo(video video) {
        this.video = video;
    }

    public Comments() {}


    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
