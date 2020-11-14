using IdentityService.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace IdentityService.API.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly IHttpContextAccessor _accessor;

        public TokenService(
            IConfiguration config,
            IHttpContextAccessor accessor)
        {
            _config = config;
            _accessor = accessor;
        }

        /// <summary>
        /// JWT 토큰을 생성하여 httponly 쿠키로 브라우저에 전송
        /// </summary>
        /// <param name="id">사용자 번호</param>
        /// <param name="email">이메일</param>
        /// <param name="name">이름</param>
        /// <param name="roleClaims">역할 목록</param>
        /// <param name="expires">만료 시간</param>
        /// <returns>JWT 토큰의 만료 시간</returns>
        public DateTime GenerateToken(long id, string email, string name, List<Claim> roleClaims, DateTime? expires = null)
        {
            //TODO : 이어서 구현하기
            //https://blog.naver.com/netscout82/221994718685
            throw new NotImplementedException();
        }
    }
}
