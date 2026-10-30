package video.player.videoplayer.Service;


import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import video.player.videoplayer.Entity.user;
import video.player.videoplayer.Entity.video;
import video.player.videoplayer.Repository.VideoRepository;
import video.player.videoplayer.Repository.userRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class    VideoService {
    private final VideoRepository VideoRepository;
    private final userRepository userRepository;


    public VideoService(VideoRepository VideoRepository, userRepository userRepository) {
        this.VideoRepository = VideoRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public video SaveVideo(MultipartFile file,
                           String title,
                           String description,
                           String email
    ) {

        user CurrentUser = userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "file cannot be empty"
            );
        }
        if (title == null || title.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "title cannot be empty"
            );
        }
        String ContentType = file.getContentType();// checks the content type what is the file aboput

        if (ContentType == null || !ContentType.toLowerCase().startsWith("video/")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "only video files are allowed  "
            );
        }

//                    String OriginalFileName = file.getOriginalFilename(); // gets the original file name we can say vdo.mp4
//                    String Extension = "";
//
//                    if(OriginalFileName != null) {
//                        int dotIndex = OriginalFileName.lastIndexOf('.'); // will get the index of the  .  in the videofile name
//                    if(dotIndex >= 0){ // if thhe index is greater than 0 then the type of the file will be stopred in the extension
//                        Extension = OriginalFileName.substring(dotIndex); // here the extensiomn is saving the file type
//                    }
//                    }
//                    String UniqueFileName = UUID.randomUUID()+Extension; // and here it is using it as the randomnly generated filename we are generating random file name because the duplicate collision may happen so we generate randome name and then we add the video typpe that is the + extension
//                    Path Destination = StorageDirectory.resolve(UniqueFileName).normalize();// .resolve combiles the directory with the file path name which had been generated randomly it constructs a path where a file can be written
//                    if(!Destination.startsWith(StorageDirectory)){
//                        throw new ResponseStatusException(
//                                HttpStatus.BAD_REQUEST, "invalid file name"
//                        );
//
//                    }

        try {
            byte[] VideoData = file.getBytes();
//                        Files.copy(file.getInputStream(), // provides an input stream which reads the uploaded file's content
//                                Destination, //specifies where the file should be stored
//                                StandardCopyOption.REPLACE_EXISTING); // java should replace an existing file

            video video = new video();
            video.setVideoData(VideoData);
            video.setTitle(title.trim());
            video.setDescription(description == null ? null : description.trim());
            video.setFileName(file.getOriginalFilename());
            video.setContentType(ContentType);
            video.setViews(0l);
            video.setFilesize(file.getSize());
            video.setUploadedAt(java.time.LocalDateTime.now());
            video.setUser(CurrentUser);

            return VideoRepository.save(video);

        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "FAILED TO SAVE VIDEO");
        }


    }


    public List<video> getAllVideo() {
        return VideoRepository.findAll();
    }

    public List<video> getMyVideos(String email) {

        // Step 1: Find the logged-in user by email
        user currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );


        return VideoRepository.findByUser(currentUser);
    }

    public video GetVideoForPlayback(Long id) {
        return VideoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Video not found"
                ));
    }

    public Boolean VideoExist(Long id) {
        return VideoRepository.existsById(id);
    }

    @Transactional
    public void DeleteVideo(Long id, String email) {

        // Step 1: Find the logged-in user
        user currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        // Step 2: Find the video
        video existingVideo = VideoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Video not found"
                        )
                );

        // Step 3: Verify video ownership
        if (existingVideo.getUser() == null ||
                existingVideo.getUser().getId() !=
                        currentUser.getId()) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to delete this video"
            );
        }

        // Step 4: Delete the video
        VideoRepository.delete(existingVideo);
    }

    // ─── updateVideoTitle ─────────────────────────────────────────────────────

    /**
     * Updates only the title of a video owned by the authenticated user.
     */
    @Transactional
    public video updateVideoTitle(Long id, String newTitle, String email) {
        user currentUser = findUserByEmail(email);
        video existingVideo = findVideoById(id);
        verifyOwnership(existingVideo, currentUser);

        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title cannot be empty");
        }

        existingVideo.setTitle(newTitle.trim());
        return VideoRepository.save(existingVideo);
    }

    // ─── updateVideoDescription ───────────────────────────────────────────────

    /**
     * Updates only the description of a video owned by the authenticated user.
     */
    @Transactional
    public video updateVideoDescription(Long id, String newDescription, String email) {
        user currentUser = findUserByEmail(email);
        video existingVideo = findVideoById(id);
        verifyOwnership(existingVideo, currentUser);

        existingVideo.setDescription(newDescription == null ? null : newDescription.trim());
        return VideoRepository.save(existingVideo);
    }

    // ─── updateVideo ──────────────────────────────────────────────────────────

    /**
     * Updates title and/or description of a video owned by the authenticated user.
     * Only fields that are non-null in the request body are applied.
     */
    @Transactional
    public video updateVideo(Long id, String newTitle, String newDescription, String email) {
        user currentUser = findUserByEmail(email);
        video existingVideo = findVideoById(id);
        verifyOwnership(existingVideo, currentUser);

        if (newTitle != null) {
            if (newTitle.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title cannot be empty");
            }
            existingVideo.setTitle(newTitle.trim());
        }

        if (newDescription != null) {
            existingVideo.setDescription(newDescription.trim());
        }

        return VideoRepository.save(existingVideo);
    }

    // ─── searchVideos ─────────────────────────────────────────────────────────

    /**
     * Searches all videos whose title contains the given keyword (case-insensitive).
     */
    public List<video> searchVideos(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search keyword cannot be empty");
        }
        return VideoRepository.findByTitleContainingIgnoreCase(keyword.trim());
    }

    // ─── incrementViews ───────────────────────────────────────────────────────

    /**
     * Atomically increments the view count of a video by 1.
     */
    @Transactional
    public video incrementViews(Long id) {
        video existingVideo = findVideoById(id);
        existingVideo.setViews(existingVideo.getViews() + 1);
        return VideoRepository.save(existingVideo);
    }

    @Transactional
    public video incrementLikes(Long id) {
        video existingVideo = findVideoById(id);
        existingVideo.setLikes(existingVideo.getLikes() + 1);
        return VideoRepository.save(existingVideo);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private user findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private video findVideoById(Long id) {
        return VideoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));
    }

    private void verifyOwnership(video existingVideo, user currentUser) {
        if (existingVideo.getUser() == null ||
                !existingVideo.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not allowed to modify this video");
        }
    }
}
