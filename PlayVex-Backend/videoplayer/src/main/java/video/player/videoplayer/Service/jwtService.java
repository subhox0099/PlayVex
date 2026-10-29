package video.player.videoplayer.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.query.KeysetScrollDelegate;
import org.springframework.stereotype.Service;
import video.player.videoplayer.Entity.user;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class jwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public jwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration}") long expiration ){
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;

    }

    public String generateToken(user user){
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

       return Jwts.builder()
                .subject(user.getEmail())
                .expiration(expiryDate)
                .signWith(secretKey)
                .claim("user", user.getId())
                .issuedAt(now)
                .compact();
    }

    public String ExtractEmail(String token){
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean istokenvalid(String token, String email) {
        try {
            String tokenEmail = ExtractEmail(token);

            return tokenEmail.equalsIgnoreCase(email);

        } catch (Exception e) {
            return false;
        }
    }
}
