# Spring Boot + MySQL CRUD Application Cheat Sheet

A minimal reference for building a basic web application with:

- Spring Boot
- MySQL
- Spring Data JPA
- Spring Security
- CRUD operations
- Basic authentication
- Role-based authorization

---

# 1. Required Dependencies

Using Spring Initializr:

- Spring Web
- Spring Data JPA
- Spring Security
- MySQL Driver
- Validation
- Lombok (optional)

---

# 2. Project Structure

```
src
└── main
    ├── java
    │   └── com.example.demo
    │       ├── controller
    │       ├── service
    │       ├── repository
    │       ├── model
    │       ├── dto
    │       ├── security
    │       ├── config
    │       └── DemoApplication.java
    │
    └── resources
        ├── application.properties
        └── data.sql
```

---

# 3. Configure MySQL

application.properties

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

spring.jpa.properties.hibernate.format_sql=true
```

Useful ddl-auto values:

- create
- create-drop
- update
- validate
- none

For development:

```
update
```

---

# 4. Entity

Example User entity.

```java
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String password;

    private String role;
}
```

Annotations:

- @Entity
- @Id
- @GeneratedValue
- @Column
- @Table
- @ManyToOne
- @OneToMany
- @ManyToMany

---

# 5. Repository

```java
public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
}
```

JpaRepository already provides:

- save()
- findById()
- findAll()
- delete()
- existsById()

---

# 6. Service Layer

Contains business logic.

```java
@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public List<User> getUsers() {
        return repository.findAll();
    }

    public User create(User user) {
        return repository.save(user);
    }
}
```

Controller should call Service.

Service should call Repository.

---

# 7. REST Controller

```java
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService service;

    @GetMapping
    public List<User> all() {
        return service.getUsers();
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return service.create(user);
    }
}
```

Common annotations:

- @RestController
- @Controller
- @RequestMapping
- @GetMapping
- @PostMapping
- @PutMapping
- @DeleteMapping
- @PathVariable
- @RequestParam
- @RequestBody

---

# 8. CRUD Endpoints

```
GET     /users

GET     /users/{id}

POST    /users

PUT     /users/{id}

DELETE  /users/{id}
```

Typical service methods:

```java
findAll()

findById()

save()

update()

deleteById()
```

---

# 9. Validation

DTO

```java
public class UserRequest {

    @NotBlank
    private String username;

    @Size(min = 8)
    private String password;
}
```

Controller

```java
@PostMapping
public User create(@Valid @RequestBody UserRequest request)
```

Useful annotations:

- @Valid
- @NotBlank
- @NotNull
- @Email
- @Min
- @Max
- @Size

---

# 10. DTO Pattern

Never expose entities directly.

Example:

```
Controller

↓

DTO

↓

Service

↓

Entity

↓

Repository
```

Example:

```
CreateUserRequest

↓

User

↓

UserResponse
```

---

# 11. Password Encoding

Never store plain passwords.

```java
@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

Encoding:

```java
user.setPassword(
    encoder.encode(password)
);
```

Verification:

```java
encoder.matches(rawPassword, encodedPassword);
```

---

# 12. Roles

Store roles like:

```
ROLE_USER

ROLE_ADMIN
```

Example entity

```java
private String role;
```

or

```java
@Enumerated(EnumType.STRING)
private Role role;
```

Enum

```java
public enum Role {

    ROLE_USER,
    ROLE_ADMIN
}
```

---

# 13. Spring Security

Security configuration.

```java
@Bean
SecurityFilterChain security(HttpSecurity http) throws Exception {

    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth

            .requestMatchers("/admin/**")
            .hasRole("ADMIN")

            .requestMatchers("/users/**")
            .hasAnyRole("USER","ADMIN")

            .anyRequest()
            .authenticated()
        )
        .httpBasic();

    return http.build();
}
```

---

# 14. UserDetailsService

Spring Security authenticates using UserDetailsService.

```java
@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    @Autowired
    UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(
            String username) {

        User user =
            repository.findByUsername(username)
                .orElseThrow();

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().replace("ROLE_", ""))
                .build();
    }
}
```

---

# 15. Authentication Flow

```
Client

↓

HTTP Basic

↓

Spring Security

↓

UserDetailsService

↓

Database

↓

BCrypt password check

↓

Authenticated user
```

---

# 16. Authorization

Method-level security.

```java
@PreAuthorize("hasRole('ADMIN')")
```

Enable:

```java
@EnableMethodSecurity
```

Examples

```java
@PreAuthorize("hasRole('ADMIN')")

@PreAuthorize("hasRole('USER')")

@PreAuthorize("hasAnyRole('ADMIN','USER')")
```

---

# 17. Exception Handling

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> error(Exception e){

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }

}
```

---

# 18. Common HTTP Status Codes

```
200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error
```

---

# 19. Relationships

One-to-many

```java
@OneToMany(mappedBy="user")
```

Many-to-one

```java
@ManyToOne
```

Many-to-many

```java
@ManyToMany
```

---

# 20. Common JPA Annotations

```
@Entity

@Table

@Id

@GeneratedValue

@Column

@OneToMany

@ManyToOne

@ManyToMany

@JoinColumn

@Enumerated

@Transient
```

---

# 21. Common Spring Annotations

```
@Service

@Repository

@RestController

@Controller

@Component

@Configuration

@Bean

@Autowired

@Value
```

---

# 22. Typical Request Flow

```
HTTP Request

↓

Controller

↓

DTO Validation

↓

Service

↓

Repository

↓

MySQL

↓

Repository

↓

Service

↓

Controller

↓

JSON Response
```

---

# 23. Minimal Authentication Database

```
users

id

username

password (BCrypt)

role
```

Example

| username | password | role |
|-----------|----------|------|
| admin | BCrypt hash | ROLE_ADMIN |
| john | BCrypt hash | ROLE_USER |

---

# 24. Testing

Useful endpoints

```
GET

POST

PUT

DELETE
```

Use:

- Postman
- curl
- Bruno
- Insomnia

Example

```
Authorization

Basic Auth

username: admin

password: admin123
```

---

# 25. Things Worth Learning Next

- JWT authentication
- Refresh tokens
- OAuth2
- Pagination
- Sorting
- Filtering
- Specifications
- Flyway or Liquibase
- Docker
- Unit testing (JUnit)
- Integration testing
- Swagger / OpenAPI
- Spring Profiles
- Global exception handling
- Logging with SLF4J
- Caching
