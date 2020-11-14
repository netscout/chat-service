using IdentityService.API.Models.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, long>
    {
        public ApplicationDbContext(DbContextOptions options)
            : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var userEntity = modelBuilder.Entity<User>();
            //User엔티티에 대해 Users테이블로 생성
            userEntity.ToTable("Users");

            //DB에 longtext로 생성되는 걸 varchar(256)등으로 변경하기 위한 코드
            userEntity.Property(u => u.PasswordHash).HasMaxLength(256);
            userEntity.Property(u => u.SecurityStamp).HasMaxLength(256);
            userEntity.Property(u => u.ConcurrencyStamp).HasMaxLength(256);
            userEntity.Property(u => u.PhoneNumber).HasMaxLength(20);

            var roleEntity = modelBuilder.Entity<Role>();
            roleEntity.ToTable("Roles");
            roleEntity.Property(r => r.ConcurrencyStamp).HasMaxLength(256);

            modelBuilder.Entity<IdentityUserRole<long>>()
                .ToTable("UserRoles");

            var loginEntity = modelBuilder.Entity<IdentityUserLogin<long>>();
            loginEntity.ToTable("UserLogins");
            loginEntity.Property(l => l.ProviderDisplayName).HasMaxLength(256);

            var userClaimEntity = modelBuilder.Entity<IdentityUserClaim<long>>();
            userClaimEntity.ToTable("UserClaims");
            userClaimEntity.Property(uc => uc.ClaimType).HasMaxLength(256);
            userClaimEntity.Property(uc => uc.ClaimValue).HasMaxLength(256);



            var roleClaimEntity = modelBuilder.Entity<IdentityRoleClaim<long>>();
            roleClaimEntity.ToTable("RoleClaims");
            roleClaimEntity.Property(rc => rc.ClaimType).HasMaxLength(256);
            roleClaimEntity.Property(rc => rc.ClaimValue).HasMaxLength(256);

            var userTokenEntity = modelBuilder.Entity<IdentityUserToken<long>>();
            userTokenEntity.ToTable("UserTokens");
            userTokenEntity.Property(ut => ut.Value).HasMaxLength(256);
        }
    }
}
