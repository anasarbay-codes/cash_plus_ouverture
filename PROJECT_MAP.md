# PROJECT_MAP.md — Cash Plus Gestion des Ouvertures

## TECH_STACK
- Backend: Java 25 + Spring Boot 4.1.0 + Spring Security 7 + JJWT 0.13.0 + Lombok 1.18.46
- Database: MySQL 8 + Spring Data JPA (Hibernate 6.6)
- Frontend: React 19 + TypeScript 6 + Vite 8 + TanStack Router/Query + Zustand + Tailwind 4
- Build: Maven (backend), Vite (frontend)

## SYSTEM_FLOW
Prospection → DemandeOuverture → SuiviOuverture
Each transition creates a NEW record in the next entity (not a single mutating record).
3 roles: Agent (own data), Validateur (validate demandes), Manager (validate + installation control).

## ARCHITECTURE
backend/src/main/java/com/cashplus/ouverture/
├── config/         SecurityConfig, WebConfig, UploadConfig
├── security/       JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
├── model/          User, Prospection, DemandeOuverture, DemandePhoto, SuiviOuverture, SuiviPhoto
│   └── enums/      Role, ProspectionState, DemandeState, SuiviState, LeadSource, AgencyCategory
├── repository/     UserRepository, ProspectionRepository, DemandeOuvertureRepository,
│                   DemandePhotoRepository, SuiviOuvertureRepository, SuiviPhotoRepository
├── dto/
│   ├── auth/       LoginRequest, LoginResponse
│   ├── prospection/ ProspectionRequest, ProspectionResponse
│   ├── demande/    DemandeRequest, DemandeResponse, PhotoResponse
│   ├── suivi/      SuiviRequest, SuiviResponse, SuiviPhotoResponse
│   └── common/     PageResponse<T>
├── controller/     AuthController, ProspectionController, DemandeController, SuiviController
├── service/        AuthService, ProspectionService, DemandeService, SuiviService, FileStorageService
├── exception/      GlobalExceptionHandler, ResourceNotFoundException, InvalidStateException, ForbiddenActionException
└── util/           ReferenceGenerator (DO-00001 sequence)

## ORPHANS & PENDING
- Frontend API integration (replace Zustand mock with Axios calls to real backend)
- Integration testing (Postman collection / automated tests)
- Production deployment configuration (Docker, env vars, etc.)
