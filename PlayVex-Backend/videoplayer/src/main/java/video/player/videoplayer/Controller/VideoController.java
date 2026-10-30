package video.player.videoplayer.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import video.player.videoplayer.DTO.UpdateVideoRequest;
import video.player.videoplayer.DTO.videoResponse;
import video.player.videoplayer.Entity.video;
import video.player.videoplayer.Service.VideoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    public final VideoService videoService;

    @Autowired
    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    // ─── GET /api/videos/allvideos ────────────────────────────────────────────

    @GetMapping("/allvideos")
    public ResponseEntity<List<videoResponse>> getAllVideos() {

        List<videoResponse> videos = videoService.getAllVideo()
                .stream()
                .map(v -> new videoResponse(
                        v.getId(),
                        v.getTitle(),
                        v.getDescription(),
                        v.getFileName(),
                        v.getContentType(),
                        v.getFilesize(),
                        v.getViews()
                ))
                .toList();

        return ResponseEntity.ok(videos);
    }

    // ─── GET /api/videos/my-videos ────────────────────────────────────────────

    @GetMapping("/my-videos")
    public ResponseEntity<List<videoResponse>> getMyVideos(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<videoResponse> videos = videoService
                .getMyVideos(userDetails.getUsername())
                .stream()
                .map(v -> new videoResponse(
                        v.getId(),
                        v.getTitle(),
                        v.getDescription(),
                        v.getFileName(),
                        v.getContentType(),
                        v.getFilesize(),
                        v.getViews()
                ))
                .toList();

        return ResponseEntity.ok(videos);
    }

    // ─── GET /api/videos/search?keyword= ─────────────────────────────────────

    /**
     * Searches videos by title keyword (case-insensitive).
     * Example: GET /api/videos/search?keyword=funny
     */
    @GetMapping("/search")
    public ResponseEntity<List<videoResponse>> searchVideos(
            @RequestParam("keyword") String keyword) {

        List<videoResponse> results = videoService.searchVideos(keyword)
                .stream()
                .map(this::toVideoResponse)
                .toList();

        return ResponseEntity.ok(results);
    }

    // ─── GET /api/videos/{id}/play ────────────────────────────────────────────

    @GetMapping("/{id}/play")
    public ResponseEntity<byte[]> playVideo(@PathVariable Long id) {

        video video = videoService.GetVideoForPlayback(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(video.getContentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + video.getFileName() + "\""
                )
                .contentLength(video.getVideoData().length)
                .body(video.getVideoData());
    }

    // ─── POST /api/videos/upload ──────────────────────────────────────────────

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<videoResponse> PostVideo(@RequestParam("file") MultipartFile file,
                                                   @RequestParam("title") String title,
                                                   @RequestParam(value = "description", required = false) String Description,
                                                   @AuthenticationPrincipal UserDetails userDetails) {

        video savedvideo = videoService.SaveVideo(file, title, Description, userDetails.getUsername());
        videoResponse response = new videoResponse(
                savedvideo.getId(),
                savedvideo.getTitle(),
                savedvideo.getDescription(),
                savedvideo.getFileName(),
                savedvideo.getContentType(),
                savedvideo.getFilesize(),
                savedvideo.getViews()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── POST /api/videos/{id}/view ───────────────────────────────────────────

    /**
     * Increments the view count of a video by 1.
     * Call this whenever a user starts playing a video.
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<Map<String, Object>> incrementViews(@PathVariable Long id) {
        video updated = videoService.incrementViews(id);
        return ResponseEntity.ok(Map.of(
                "message", "View count updated",
                "videoId", updated.getId(),
                "views", updated.getViews()
        ));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> incrementLikes(@PathVariable Long id) {
        video updated = videoService.incrementLikes(id);
        return ResponseEntity.ok(Map.of(
                "message", "Likes count updated",
                "videoId", updated.getId(),
                "Likes", updated.getLikes()
        ));
    }

    // ─── PATCH /api/videos/{id}/title ─────────────────────────────────────────

    /**
     * Updates only the title of the video. Must be the video owner.
     */
    @PatchMapping("/{id}/title")
    public ResponseEntity<videoResponse> updateVideoTitle(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String newTitle = body.get("title");
        video updated = videoService.updateVideoTitle(id, newTitle, userDetails.getUsername());
        return ResponseEntity.ok(toVideoResponse(updated));
    }

    // ─── PATCH /api/videos/{id}/description ───────────────────────────────────

    /**
     * Updates only the description of the video. Must be the video owner.
     */
    @PatchMapping("/{id}/description")
    public ResponseEntity<videoResponse> updateVideoDescription(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String newDescription = body.get("description");
        video updated = videoService.updateVideoDescription(id, newDescription, userDetails.getUsername());
        return ResponseEntity.ok(toVideoResponse(updated));
    }

    // ─── PATCH /api/videos/{id} ───────────────────────────────────────────────

    /**
     * Updates title and/or description of the video. Must be the video owner.
     * Send only the fields you want to change (both are optional).
     */
    @PatchMapping("/{id}")
    public ResponseEntity<videoResponse> updateVideo(
            @PathVariable Long id,
            @RequestBody UpdateVideoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        video updated = videoService.updateVideo(
                id,
                request.getTitle(),
                request.getDescription(),
                userDetails.getUsername()
        );
        return ResponseEntity.ok(toVideoResponse(updated));
    }

    // ─── DELETE /api/videos/{id} ──────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideoById(@PathVariable long id,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        if (!videoService.VideoExist(id)) {
            return ResponseEntity.notFound().build();
        }
        videoService.DeleteVideo(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private videoResponse toVideoResponse(video v) {
        return new videoResponse(
                v.getId(),
                v.getTitle(),
                v.getDescription(),
                v.getFileName(),
                v.getContentType(),
                v.getFilesize(),
                v.getViews()
        );
    }
}