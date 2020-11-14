using IdentityService.API.Data;
using IdentityService.API.Models.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace IdentityService.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment hostEnvironment)
        {
            Configuration = configuration;
            Env = hostEnvironment;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Env { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();

            var connString = Configuration["ConnectionStrings:DefaultConnection"];

            services.AddDbContext<ApplicationDbContext>(
                options =>
                    options//.UseLazyLoadingProxies()
                    .UseMySql(
                        connString,
                        ServerVersion.AutoDetect(connString)));

            //User타입을 기본으로 하는 인증 설정
            services
                .AddDefaultIdentity<User>(options =>
                {
                    options.SignIn.RequireConfirmedAccount = true;

                    //패스워드의 조건설정
                    //숫자, 소문자, 특수문자 포함 8자 이상
                    options.Password.RequireDigit = true;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireUppercase = false;
                    options.Password.RequireNonAlphanumeric = true;
                    options.Password.RequiredLength = 8;

                    //이메일은 중복 불가
                    options.User.RequireUniqueEmail = true;

                    //한글도 사용자 이름으로 설정 가능하도록
                    options.User.AllowedUserNameCharacters = string.Empty;
                })
                .AddRoles<Role>()
                .AddEntityFrameworkStores<ApplicationDbContext>();

            bool requireHttpsMetadata = false;

            if (!Env.IsDevelopment())
            {
                requireHttpsMetadata = true;
            }

            //Jwt 토큰을 통해 인증하도록 설정하기
            services.AddAuthentication(
                JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    //개발에서만 false세팅
                    options.RequireHttpsMetadata = requireHttpsMetadata;

                    //인증 성공 후 토큰을 저장해두고
                    options.SaveToken = true;

                    //JWT 설정
                    options.TokenValidationParameters =
                        new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidAudience = Configuration["Jwt:Audience"],
                            ValidIssuer = Configuration["Jwt:Issuer"],
                            IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(
                                    Configuration["Jwt:Key"])),
                            ValidateIssuerSigningKey = true,
                            RequireExpirationTime = true,
                            ValidateLifetime = true
                        };
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
