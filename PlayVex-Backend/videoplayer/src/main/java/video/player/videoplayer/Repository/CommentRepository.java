package video.player.videoplayer.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import video.player.videoplayer.Entity.Comments;
import video.player.videoplayer.Entity.user;
import video.player.videoplayer.Entity.video;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comments,Long> {
    List<Comments> findByVideo(video video);
}
