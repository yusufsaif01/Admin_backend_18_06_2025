module.exports = ({ email, name, member_type, from_email }) => {
  return {
    to: email,
    subject: `${name} aadhaar approval confirmation`,
    html() {
      return `
        <tbody style="display: block;width: 80%; margin:auto;">
			<tr style="height: 20px;">
				<td></td>
			</tr>

			<!-- paragraph -->
			<tr style="height: 20px;">
				<td></td>
			</tr>
			<tr style="display:block; width: 100%;text-align: center;">
				<td style="display:block; width: 100%; text-align: center;">
					<p style="font-family: 'Montserrat', sans-serif;
					font-size: 16px;font-weight: 300;color:#626262;
					">
						Hello Admin
					</p>
				</td>
			</tr>

			<tr style="height: 10px;">
				<td></td>
			</tr>

			<tr style="display:block; width: 100%;text-align: center;">
				<td style="display:block; width: 100%; text-align: center;">
					<p style="font-family: 'Montserrat', sans-serif;
					font-size: 16px;font-weight: 300;color:#626262;
					">
						Aadhaar details submitted by the following player, have been approved through the system.
					</p>
				</td>
			</tr>

			<tr style="height: 10px;">
				<td></td>
			</tr>

			<tr style="display:block; width: 100%;text-align: center;">
				<td style="display:block; width: 100%; text-align: center;">
					<p style="font-family: 'Montserrat', sans-serif;
					font-size: 20px; font-weight: 700;display:block;color:#626262;">
						Player Name: ${name}
					</p>
				</td>
			</tr>

			<tr style="height: 10px;">
				<td></td>
			</tr>

			<tr style="display:block; width: 100%;text-align: center;">
				<td style="display:block; width: 100%; text-align: center;">
					<p style="font-family: 'Montserrat', sans-serif;
					font-size: 20px; font-weight: 700;display:block;color:#626262;">
						Member email id: ${from_email}
					</p>
				</td>
			</tr>


			<tr style="height: 40px;">
				<td></td>
			</tr>

			<tr style=" height: 20px;">
				<td></td>
			</tr>
			<!-- end  -->
		</tbody>
      `;
    },
  };
};
