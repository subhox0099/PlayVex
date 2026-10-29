
        package video.player.videoplayer.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import video.player.videoplayer.Entity.Comments;
import video.player.videoplayer.Service.CommentServices;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentServices commentServices;

    public CommentController(CommentServices commentServices) {
        this.commentServices = commentServices;
    }


    @PostMapping("/video/{videoId}")
    public ResponseEntity<Comments> addComment(
            @PathVariable Long videoId,
            @RequestBody Comments comment) {

        Comments savedComment =
                commentServices.addComment(comment, videoId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedComment);
    }

    @GetMapping("/video/{videoId}")
    public ResponseEntity<List<Comments>> getCommentsByVideoId(
            @PathVariable Long videoId) {

        List<Comments> comments =
                commentServices.findAllByVideoId(videoId);

        return ResponseEntity.ok(comments);
    }


    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId) {

        commentServices.deleteComment(commentId);

        return ResponseEntity.noContent().build();
    }
}
