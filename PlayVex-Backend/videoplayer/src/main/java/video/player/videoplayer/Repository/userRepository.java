package video.player.videoplayer.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import video.player.videoplayer.Entity.user;

import java.util.Optional;
@Repository
public interface userRepository extends JpaRepository<user,Long> {
    Optional<user> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
