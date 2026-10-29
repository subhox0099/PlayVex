package video.player.videoplayer.Service;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import video.player.videoplayer.Entity.Comments;
import video.player.videoplayer.Entity.video;
import video.player.videoplayer.Repository.CommentRepository;
import video.player.videoplayer.Repository.VideoRepository;

import java.util.List;

@Service
public class CommentServices {

    private final CommentRepository commentRepository;
    private final VideoRepository videoRepository;

    public CommentServices(
            CommentRepository commentRepository,
            VideoRepository videoRepository
    ) {
        this.commentRepository = commentRepository;
        this.videoRepository = videoRepository;
    }

    // Add a comment to a video
    public Comments addComment(Comments comment, Long videoId) {

        // Retrieve the authenticated user
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName().equals("anonymousUser")) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in to comment"
            );
        }

        String username = authentication.getName();

        // Find the video
        video video = videoRepository.findById(videoId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Video not found"
                        ));

        // Set the comment details
        comment.setAuthor(username);
        comment.setVideo(video);

        // Save the comment
        return commentRepository.save(comment);
    }

    // Get all comments for a video
    public List<Comments> findAllByVideoId(Long videoId) {

        video video = videoRepository.findById(videoId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Video not found"
                        ));

        return commentRepository.findByVideo(video);
    }

    // Delete a comment
    public void deleteComment(Long commentId) {

        Comments comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Comment not found"
                        ));

        commentRepository.delete(comment);
    }
}