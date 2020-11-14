using Microsoft.AspNetCore.Identity;

namespace IdentityService.API.Models.Identity
{
    public class Role:IdentityRole<long>
    {
        public Role()
        {

        }

        public Role(string roleName)
            : base(roleName)
        {

        }
    }
}
